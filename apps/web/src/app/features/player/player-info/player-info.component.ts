import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { MediaModel, ShareResourceType } from '@harbor-play-media/shared-api';
import { ShareDialogComponent, ShareDialogData } from '@harbor-play-media/ui';
import { formatFileSize } from '../../../core/mock-data';
import { MediaApiService } from '../../../core/services/media-api.service';
import { ShareApiService } from '../../../core/services/share-api.service';

@Component({
  selector: 'app-player-info',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatChipsModule, MatTooltipModule],
  templateUrl: './player-info.component.html',
  styleUrl: './player-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerInfoComponent {
  private readonly mediaApiService: MediaApiService = inject(MediaApiService);
  private readonly shareApiService: ShareApiService = inject(ShareApiService);
  private readonly dialog: MatDialog = inject(MatDialog);

  readonly media = input.required<MediaModel>();

  protected readonly tags = computed<string[]>(() => this.media().tags ?? []);
  protected readonly uploaderName = computed<string | undefined>(() => this.media().uploadedByUserName);

  protected formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }

  protected onDownload(): void {
    this.mediaApiService.download(this.media().id);
  }

  protected onShare(): void {
    const mediaId: string = this.media().id;
    const data: ShareDialogData = {
      resourceType: ShareResourceType.MEDIA,
      resourceId: mediaId,
      loadShares: () =>
        this.shareApiService.getSharesForResource(ShareResourceType.MEDIA, mediaId),
      addShare: (email: string) =>
        this.shareApiService.shareResource(ShareResourceType.MEDIA, mediaId, email),
      revokeShare: (id: string) => this.shareApiService.revokeShare(id),
    };

    this.dialog.open(ShareDialogComponent, { data, width: '440px' });
  }
}
