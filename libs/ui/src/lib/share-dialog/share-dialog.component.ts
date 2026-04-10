import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ShareModel, ShareResourceType } from '@harbor-play-media/shared-api';

export interface ShareDialogData {
  resourceType: ShareResourceType;
  resourceId: string;
  loadShares: () => Observable<ShareModel[]>;
  addShare: (email: string) => Observable<ShareModel>;
  revokeShare: (id: string) => Observable<void>;
}

@Component({
  selector: 'lib-share-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
  ],
  templateUrl: './share-dialog.component.html',
  styleUrl: './share-dialog.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShareDialogComponent implements OnInit {
  private readonly data: ShareDialogData = inject(MAT_DIALOG_DATA);

  readonly shares = signal<ShareModel[]>([]);
  readonly loading = signal<boolean>(true);
  readonly sharing = signal<boolean>(false);
  readonly email = signal<string>('');
  readonly error = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.loadShares();
  }

  onEmailInput(event: Event): void {
    this.email.set((event.target as HTMLInputElement).value);
    this.error.set(undefined);
  }

  onShare(): void {
    const emailValue: string = this.email().trim();
    if (!emailValue || this.sharing()) return;

    this.sharing.set(true);
    this.error.set(undefined);

    this.data.addShare(emailValue).subscribe({
      next: (share: ShareModel): void => {
        this.shares.update((list: ShareModel[]) => [share, ...list]);
        this.email.set('');
        this.sharing.set(false);
      },
      error: (err: unknown): void => {
        const message: string = this.extractErrorMessage(err);
        this.error.set(message);
        this.sharing.set(false);
      },
    });
  }

  onRevoke(shareId: string): void {
    this.data.revokeShare(shareId).subscribe({
      next: (): void => {
        this.shares.update((list: ShareModel[]) =>
          list.filter((s: ShareModel) => s.id !== shareId),
        );
      },
    });
  }

  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.onShare();
    }
  }

  private loadShares(): void {
    this.loading.set(true);
    this.data.loadShares().subscribe({
      next: (shares: ShareModel[]): void => {
        this.shares.set(shares);
        this.loading.set(false);
      },
      error: (): void => {
        this.loading.set(false);
      },
    });
  }

  private extractErrorMessage(err: unknown): string {
    if (
      typeof err === 'object' &&
      err !== undefined &&
      err !== null &&
      'error' in err
    ) {
      const inner: unknown = (err as { error: unknown }).error;
      if (typeof inner === 'object' && inner !== undefined && inner !== null && 'message' in inner) {
        return String((inner as { message: unknown }).message);
      }
    }
    return 'Failed to share. Please try again.';
  }
}
