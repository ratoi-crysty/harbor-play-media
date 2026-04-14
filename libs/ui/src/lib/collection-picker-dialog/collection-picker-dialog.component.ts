import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CollectionModel } from '@harbor-play-media/shared-api';

export interface CollectionPickerDialogData {
  title: string;
  loadCollections: () => Observable<CollectionModel[]>;
  excludeIds?: string[];
  allowRoot?: boolean;
  currentCollectionId?: string;
}

export interface CollectionPickerResult {
  collectionId: string | undefined;
}

@Component({
  selector: 'lib-collection-picker-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './collection-picker-dialog.component.html',
  styleUrl: './collection-picker-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionPickerDialogComponent implements OnInit {
  protected readonly data: CollectionPickerDialogData = inject(MAT_DIALOG_DATA);
  private readonly dialogRef: MatDialogRef<CollectionPickerDialogComponent, CollectionPickerResult> =
    inject(MatDialogRef);

  readonly collections = signal<CollectionModel[]>([]);
  readonly loading = signal<boolean>(true);
  readonly selectedId = signal<string | undefined>(this.data.currentCollectionId);

  protected get showRoot(): boolean {
    return this.data.allowRoot !== false;
  }

  protected get canConfirm(): boolean {
    return this.selectedId() !== this.data.currentCollectionId;
  }

  ngOnInit(): void {
    this.data.loadCollections().subscribe({
      next: (collections: CollectionModel[]): void => {
        const excludeSet: Set<string> = new Set(this.data.excludeIds ?? []);
        const filtered: CollectionModel[] = collections.filter(
          (c: CollectionModel) => !excludeSet.has(c.id),
        );
        this.collections.set(filtered);
        this.loading.set(false);
      },
      error: (): void => {
        this.loading.set(false);
      },
    });
  }

  protected onSelect(id: string | undefined): void {
    this.selectedId.set(id);
  }

  protected isSelected(id: string | undefined): boolean {
    return this.selectedId() === id;
  }

  protected onConfirm(): void {
    this.dialogRef.close({ collectionId: this.selectedId() });
  }
}
