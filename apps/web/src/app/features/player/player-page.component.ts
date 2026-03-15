import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MediaModel } from '@harbor-play-media/shared-api';
import { MediaCardComponent } from '@harbor-play-media/ui';
import { MediaPlayerComponent } from './media-player/media-player.component';
import { PlayerInfoComponent } from './player-info/player-info.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { MediaApiService } from '../../core/services/media-api.service';
import { ErrorReportingService } from '../../core/services/error-reporting.service';

@Component({
  selector: 'app-player-page',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MediaCardComponent,
    MediaPlayerComponent,
    PlayerInfoComponent,
  ],
  templateUrl: './player-page.component.html',
  styleUrl: './player-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerPageComponent {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);
  private readonly mediaApiService: MediaApiService = inject(MediaApiService);
  private readonly errorReporting: ErrorReportingService = inject(ErrorReportingService);

  private readonly allMedia = toSignal(
    this.mediaApiService.getAll().pipe(
      catchError((err: unknown) => {
        this.errorReporting.notify(err, 'player-load');
        return of([]);
      }),
    ),
    { initialValue: [] as MediaModel[] },
  );

  protected readonly mediaId = toSignal(
    this.route.params.pipe(map((p: Params) => p['id'] as string)),
    { initialValue: '' },
  );

  protected readonly currentMedia = computed<MediaModel | undefined>(() =>
    this.allMedia().find((m: MediaModel) => m.id === this.mediaId()),
  );

  protected readonly upNext = computed<MediaModel[]>(() =>
    this.allMedia().filter((m: MediaModel) => m.id !== this.mediaId()).slice(0, 6),
  );

  constructor() {
    effect(() => {
      const id: string = this.mediaId();
      if (id) {
        this.mediaApiService.getById(id).subscribe();
      }
    });
  }

  protected goBack(): void {
    void this.router.navigate(['/']);
  }
}
