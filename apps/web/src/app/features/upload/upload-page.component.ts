import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MediaApiService } from '../../core/services/media-api.service';

interface UploadState {
  title: string;
  description: string;
  mediaFile: File | null;
  thumbnailFile: File | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

@Component({
  selector: 'app-upload-page',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
    MatCardModule,
  ],
  templateUrl: './upload-page.component.html',
  styleUrl: './upload-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadPageComponent {
  private readonly mediaApiService: MediaApiService = inject(MediaApiService);
  private readonly router: Router = inject(Router);

  readonly state = signal<UploadState>({
    title: '',
    description: '',
    mediaFile: null,
    thumbnailFile: null,
    loading: false,
    error: null,
    success: false,
  });

  updateField(field: 'title' | 'description', event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;
    this.state.update((s: UploadState) => ({ ...s, [field]: value }));
  }

  onMediaFileChange(event: Event): void {
    const file: File | undefined = (event.target as HTMLInputElement).files?.[0];
    this.state.update((s: UploadState) => ({ ...s, mediaFile: file ?? null }));
  }

  onThumbnailFileChange(event: Event): void {
    const file: File | undefined = (event.target as HTMLInputElement).files?.[0];
    this.state.update((s: UploadState) => ({ ...s, thumbnailFile: file ?? null }));
  }

  triggerFileInput(inputId: string): void {
    const el: HTMLElement | null = document.getElementById(inputId);
    el?.click();
  }

  submit(): void {
    const s: UploadState = this.state();
    if (s.loading || !s.title.trim() || !s.mediaFile) return;

    this.state.update((st: UploadState) => ({ ...st, loading: true, error: null }));

    this.mediaApiService
      .upload(s.title.trim(), s.description.trim(), s.mediaFile, s.thumbnailFile ?? undefined)
      .subscribe({
        next: (): void => {
          this.state.update((st: UploadState) => ({ ...st, loading: false, success: true }));
        },
        error: (): void => {
          this.state.update((st: UploadState) => ({
            ...st,
            loading: false,
            error: 'Upload failed. Please try again.',
          }));
        },
      });
  }

  goToLibrary(): void {
    void this.router.navigate(['/']);
  }
}
