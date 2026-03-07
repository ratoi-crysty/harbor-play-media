import { Component, computed, inject, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Params, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MediaModel } from '@harbor-play-media/shared-api';
import { MediaCardComponent } from '@harbor-play-media/ui';
import { MOCK_MEDIA, getMockMediaById } from '../../core/mock-data';
import { PlayerControlsComponent } from './player-controls/player-controls.component';
import { PlayerInfoComponent } from './player-info/player-info.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

@Component({
  selector: 'app-player',
  standalone: true,
  imports: [
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MediaCardComponent,
    PlayerControlsComponent,
    PlayerInfoComponent,
  ],
  templateUrl: './player.component.html',
  styleUrl: './player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerComponent {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  protected readonly currentMedia = toSignal(
    this.route.params.pipe(map(({ id }: Params): MediaModel => getMockMediaById(id))),
  );
  protected readonly upNext = computed<MediaModel[]>(() =>
    MOCK_MEDIA.filter((m: MediaModel) => m.id !== this.currentMedia()?.id).slice(0, 6),
  );

  protected goBack(): void {
    void this.router.navigate(['/']);
  }
}
