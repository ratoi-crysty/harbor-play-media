import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpEventType, HttpResponse, HttpUploadProgressEvent } from '@angular/common/http';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CollectionModel, MediaModel } from '@harbor-play-media/shared-api';
import {
  CollectionPickerDialogComponent,
  CollectionPickerDialogData,
  CollectionPickerResult,
} from '@harbor-play-media/ui';
import { CollectionApiService } from '../../core/services/collection-api.service';
import { MediaApiService } from '../../core/services/media-api.service';
import { ErrorReportingService } from '../../core/services/error-reporting.service';

type FileUploadStatus = 'pending' | 'uploading' | 'complete' | 'error';

interface FileEntry {
  id: number;
  file: File;
  title: string;
  status: FileUploadStatus;
  progress: number;
  error?: string;
}

@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressBarModule,
    MatIconModule,
    MatCardModule,
    MatChipsModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadPageComponent implements OnInit {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly dialog: MatDialog = inject(MatDialog);
  private readonly mediaApiService: MediaApiService = inject(MediaApiService);
  private readonly collectionApi: CollectionApiService = inject(CollectionApiService);
  private readonly errorReporting: ErrorReportingService = inject(ErrorReportingService);

  private nextId = 0;

  readonly files = signal<FileEntry[]>([]);
  readonly tags = signal<string[]>([]);
  readonly collectionId = signal<string | undefined>(undefined);
  readonly collectionName = signal<string>('No collection');
  readonly dragOver = signal<boolean>(false);
  readonly uploading = signal<boolean>(false);
  readonly allDone = signal<boolean>(false);

  readonly separatorKeyCodes: number[] = [ENTER, COMMA];

  ngOnInit(): void {
    const id: string | undefined = this.route.snapshot.queryParamMap.get('collectionId') ?? undefined;
    if (id) {
      this.collectionId.set(id);
      this.collectionApi.getCollection(id).subscribe({
        next: (collection: CollectionModel): void => {
          this.collectionName.set(collection.name);
        },
      });
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.dragOver.set(false);

    const droppedFiles: FileList | undefined = event.dataTransfer?.files;
    if (droppedFiles) {
      this.addFiles(droppedFiles);
    }
  }

  onFileInputChange(event: Event): void {
    const input: HTMLInputElement = event.target as HTMLInputElement;
    if (input.files) {
      this.addFiles(input.files);
      input.value = '';
    }
  }

  triggerFileInput(inputId: string): void {
    const el: HTMLElement | undefined = document.getElementById(inputId) ?? undefined;
    el?.click();
  }

  updateFileTitle(id: number, event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;
    this.files.update((list: FileEntry[]) =>
      list.map((f: FileEntry) => (f.id === id ? { ...f, title: value } : f)),
    );
  }

  removeFile(id: number): void {
    this.files.update((list: FileEntry[]) => list.filter((f: FileEntry) => f.id !== id));
  }

  addTag(event: MatChipInputEvent): void {
    const value: string = (event.value || '').trim();
    if (value) {
      this.tags.update((t: string[]) => [...t, value]);
    }
    event.chipInput.clear();
  }

  onPickCollection(): void {
    const data: CollectionPickerDialogData = {
      title: 'Choose Collection',
      loadCollections: () => this.collectionApi.getCollections(),
      allowRoot: true,
      currentCollectionId: this.collectionId(),
    };
    const ref = this.dialog.open<CollectionPickerDialogComponent, CollectionPickerDialogData, CollectionPickerResult>(
      CollectionPickerDialogComponent,
      { data, width: '440px' },
    );

    ref.afterClosed().subscribe((result: CollectionPickerResult | undefined) => {
      if (!result) return;
      this.collectionId.set(result.collectionId);
      if (result.collectionId) {
        this.collectionApi.getCollection(result.collectionId).subscribe({
          next: (collection: CollectionModel): void => {
            this.collectionName.set(collection.name);
          },
        });
      } else {
        this.collectionName.set('No collection');
      }
    });
  }

  removeTag(index: number): void {
    this.tags.update((t: string[]) => t.filter((_: string, i: number) => i !== index));
  }

  startUpload(): void {
    const entries: FileEntry[] = this.files();
    const pending: FileEntry[] = entries.filter((f: FileEntry) => f.status === 'pending');
    if (pending.length === 0) return;

    this.uploading.set(true);

    for (const entry of pending) {
      this.uploadFile(entry);
    }
  }

  goToLibrary(): void {
    void this.router.navigate(['/']);
  }

  getStatusIcon(status: FileUploadStatus): string {
    switch (status) {
      case 'complete':
        return 'check_circle';
      case 'error':
        return 'error';
      case 'uploading':
        return 'cloud_upload';
      default:
        return 'schedule';
    }
  }

  formatFileSize(bytes: number): string {
    if (bytes >= 1073741824) return `${(bytes / 1073741824).toFixed(1)} GB`;
    if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(0)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  }

  private addFiles(fileList: FileList): void {
    const newEntries: FileEntry[] = Array.from(fileList)
      .filter((f: File) => f.type.startsWith('video/') || f.type.startsWith('audio/'))
      .map((f: File) => ({
        id: this.nextId++,
        file: f,
        title: this.stripExtension(f.name),
        status: 'pending' as FileUploadStatus,
        progress: 0,
      }));

    this.files.update((list: FileEntry[]) => [...list, ...newEntries]);
  }

  private stripExtension(name: string): string {
    const dotIndex: number = name.lastIndexOf('.');
    return dotIndex > 0 ? name.substring(0, dotIndex) : name;
  }

  private uploadFile(entry: FileEntry): void {
    this.updateEntry(entry.id, { status: 'uploading', progress: 0 });

    this.mediaApiService
      .upload({
        title: entry.title.trim() || entry.file.name,
        description: '',
        mediaFile: entry.file,
        tags: this.tags(),
        collectionId: this.collectionId(),
      })
      .subscribe({
        next: (event: unknown): void => {
          if (this.isUploadProgress(event)) {
            const progress: number = event.total
              ? Math.round((100 * event.loaded) / event.total)
              : 0;
            this.updateEntry(entry.id, { progress });
          } else if (this.isHttpResponse(event)) {
            this.updateEntry(entry.id, { status: 'complete', progress: 100 });
            this.checkAllDone();
          }
        },
        error: (err: unknown): void => {
          this.errorReporting.notify(err, 'media-upload');
          this.updateEntry(entry.id, {
            status: 'error',
            error: 'Upload failed',
          });
          this.checkAllDone();
        },
      });
  }

  private isUploadProgress(event: unknown): event is HttpUploadProgressEvent {
    return (
      typeof event === 'object' &&
      event !== null &&
      'type' in event &&
      (event as { type: number }).type === HttpEventType.UploadProgress
    );
  }

  private isHttpResponse(event: unknown): event is HttpResponse<MediaModel> {
    return (
      typeof event === 'object' &&
      event !== null &&
      'type' in event &&
      (event as { type: number }).type === HttpEventType.Response
    );
  }

  private updateEntry(id: number, patch: Partial<FileEntry>): void {
    this.files.update((list: FileEntry[]) =>
      list.map((f: FileEntry) => (f.id === id ? { ...f, ...patch } : f)),
    );
  }

  private checkAllDone(): void {
    const entries: FileEntry[] = this.files();
    const allFinished: boolean = entries.every(
      (f: FileEntry) => f.status === 'complete' || f.status === 'error',
    );
    if (allFinished) {
      this.uploading.set(false);
      const allSucceeded: boolean = entries.every((f: FileEntry) => f.status === 'complete');
      if (allSucceeded) {
        this.allDone.set(true);
      }
    }
  }
}
