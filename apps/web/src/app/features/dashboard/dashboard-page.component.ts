import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MediaModel } from '@harbor-play-media/shared-api';
import { MediaCardComponent } from '@harbor-play-media/ui';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, Observable, of } from 'rxjs';
import { MediaApiService } from '../../core/services/media-api.service';
import { ErrorReportingService } from '../../core/services/error-reporting.service';
import { formatDuration } from '../../core/mock-data';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, MediaCardComponent],
  templateUrl: './dashboard-page.component.html',
  styleUrl: './dashboard-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPageComponent {
  private readonly router: Router = inject(Router);
  private readonly mediaApiService: MediaApiService = inject(MediaApiService);
  private readonly errorReporting: ErrorReportingService = inject(ErrorReportingService);

  protected readonly allMedia = toSignal(
    this.mediaApiService.getAll().pipe(
      catchError((err: unknown): Observable<MediaModel[]> => {
        this.errorReporting.notify(err, 'dashboard-load');
        return of([]);
      }),
    ),
    { initialValue: [] },
  );
  protected readonly featured = computed<MediaModel | undefined>(() => this.allMedia()[0]);
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
