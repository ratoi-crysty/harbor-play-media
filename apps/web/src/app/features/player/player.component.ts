import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MediaModel } from '@harbor-play-media/shared-api';
import { MediaCardComponent } from '@harbor-play-media/ui';
import { MOCK_MEDIA, getMockMediaById } from '../../core/mock-data';
import { PlayerControlsComponent } from './player-controls/player-controls.component';
import { PlayerInfoComponent } from './player-info/player-info.component';

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
})
export class PlayerComponent implements OnInit {
  private readonly route: ActivatedRoute = inject(ActivatedRoute);
  private readonly router: Router = inject(Router);

  protected readonly currentMedia = signal<MediaModel | undefined>(undefined);
  protected readonly upNext = computed<MediaModel[]>(() =>
    MOCK_MEDIA.filter((m: MediaModel) => m.id !== this.currentMedia()?.id).slice(0, 6)
  );

  ngOnInit(): void {
    const id: string = this.route.snapshot.paramMap.get('id') ?? '';
    this.currentMedia.set(getMockMediaById(id));
  }

  protected goBack(): void {
    void this.router.navigate(['/']);
  }

  protected onUpNextClick(id: string): void {
    void this.router.navigate(['/player', id]);
  }
}
