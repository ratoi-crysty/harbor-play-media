import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MediaModel } from '@harbor-play-media/shared-api';
import { MediaCardComponent } from '@harbor-play-media/ui';
import { formatDuration, MOCK_MEDIA } from '../../core/mock-data';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MediaCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly router: Router = inject(Router);

  protected readonly allMedia = signal<MediaModel[]>(MOCK_MEDIA);
  protected readonly featured = computed<MediaModel>(() => this.allMedia()[0]);
  protected readonly recentlyAdded = computed<MediaModel[]>(() => this.allMedia().slice(0, 6));
  protected readonly mostPopular = computed<MediaModel[]>(() =>
    [...this.allMedia()].sort((a: MediaModel, b: MediaModel) => b.viewCount - a.viewCount).slice(0, 6),
  );

  protected formatDuration(seconds: number): string {
    return formatDuration(seconds);
  }

  protected onMediaClick(id: string): void {
    void this.router.navigate(['/player', id]);
  }
}
