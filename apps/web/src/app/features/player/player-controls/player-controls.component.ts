import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MediaModel } from '@harbor-play-media/shared-api';
import { formatDuration } from '../../../core/mock-data';

@Component({
  selector: 'app-player-controls',
  standalone: true,
  imports: [MatIconModule, MatSliderModule, MatButtonModule, MatTooltipModule],
  templateUrl: './player-controls.component.html',
  styleUrl: './player-controls.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerControlsComponent {
  readonly media = input.required<MediaModel>();
  readonly isPlaying = input.required<boolean>();
  readonly currentTime = input.required<number>();
  readonly duration = input.required<number>();
  readonly volume = input.required<number>();
  readonly isMuted = input.required<boolean>();
  readonly isFullscreen = input.required<boolean>();

  readonly togglePlay = output<void>();
  readonly skipBackward = output<void>();
  readonly skipForward = output<void>();
  readonly toggleMute = output<void>();
  readonly progressChange = output<number>();
  readonly volumeChange = output<number>();
  readonly toggleFullscreen = output<void>();

  protected readonly currentTimeLabel = computed<string>(() => formatDuration(Math.floor(this.currentTime())));
  protected readonly totalTimeLabel = computed<string>(() => formatDuration(Math.floor(this.duration())));
  protected readonly progress = computed<number>(() =>
    this.duration() > 0 ? (this.currentTime() / this.duration()) * 100 : 0,
  );
  protected readonly volumeIcon = computed<string>(() => {
    if (this.isMuted() || this.volume() === 0) return 'volume_off';
    if (this.volume() < 50) return 'volume_down';
    return 'volume_up';
  });

  protected readonly qualityLabel = computed<string>(() => this.media().resolution ?? '');

  protected onProgressChange(value: number | null): void {
    if (value !== null) {
      this.progressChange.emit(value);
    }
  }

  protected onVolumeChange(event: Event): void {
    if (!(event.target instanceof HTMLInputElement) || !event.target.value) {
      return;
    }

    this.volumeChange.emit(+event.target.value);
  }
}
