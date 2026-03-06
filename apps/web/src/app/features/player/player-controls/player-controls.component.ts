import { Component, input, signal } from '@angular/core';
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
})
export class PlayerControlsComponent {
  readonly media = input.required<MediaModel>();

  protected isPlaying = signal<boolean>(false);
  protected progress = signal<number>(0);
  protected volume = signal<number>(80);
  protected selectedQuality = signal<string>('Auto');

  protected get currentTimeLabel(): string {
    const total: number = this.media().duration;
    return formatDuration(Math.floor((this.progress() / 100) * total));
  }

  protected get totalTimeLabel(): string {
    return formatDuration(this.media().duration);
  }

  protected togglePlay(): void {
    this.isPlaying.update((v: boolean) => !v);
  }

  protected onProgressChange(value: number | null): void {
    if (value !== null) {
      this.progress.set(value);
    }
  }

  protected onVolumeChange(value: number | null): void {
    if (value !== null) {
      this.volume.set(value);
    }
  }

  protected cycleQuality(): void {
    const qualities: string[] = ['Auto', '4K', '1080p', '720p', '480p'];
    const current: number = qualities.indexOf(this.selectedQuality());
    this.selectedQuality.set(qualities[(current + 1) % qualities.length]);
  }
}
