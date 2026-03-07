import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  OnDestroy,
  signal,
} from '@angular/core';
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
export class PlayerControlsComponent implements OnDestroy {
  readonly media = input.required<MediaModel>();
  readonly mediaEl = input.required<HTMLVideoElement>();

  protected readonly isPlaying = signal<boolean>(false);
  protected readonly currentTime = signal<number>(0);
  protected readonly duration = signal<number>(0);
  protected readonly volume = signal<number>(80);
  protected readonly isMuted = signal<boolean>(false);
  protected readonly isFullscreen = signal<boolean>(false);

  protected readonly progress = computed<number>(() =>
    this.duration() > 0 ? (this.currentTime() / this.duration()) * 100 : 0
  );

  protected readonly currentTimeLabel = computed<string>(() =>
    formatDuration(Math.floor(this.currentTime()))
  );

  protected readonly totalTimeLabel = computed<string>(() =>
    formatDuration(Math.floor(this.duration()))
  );

  protected readonly volumeIcon = computed<string>(() => {
    if (this.isMuted() || this.volume() === 0) return 'volume_off';
    if (this.volume() < 50) return 'volume_down';
    return 'volume_up';
  });

  protected readonly qualityLabel = computed<string>(
    () => this.media().resolution ?? ''
  );

  private cleanupFns: (() => void)[] = [];

  constructor() {
    effect(() => {
      this.setupListeners(this.mediaEl());
    });
  }

  ngOnDestroy(): void {
    this.cleanupFns.forEach((fn: () => void) => fn());
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
  }

  private readonly onFullscreenChange = (): void => {
    this.isFullscreen.set(!!document.fullscreenElement);
  };

  private setupListeners(el: HTMLVideoElement): void {
    this.cleanupFns.forEach((fn: () => void) => fn());
    this.cleanupFns = [];

    const handlers: Record<string, EventListener> = {
      timeupdate: () => this.currentTime.set(el.currentTime),
      play: () => this.isPlaying.set(true),
      pause: () => this.isPlaying.set(false),
      ended: () => this.isPlaying.set(false),
      durationchange: () => {
        const d: number = el.duration;
        this.duration.set(isFinite(d) ? d : 0);
      },
      volumechange: () => {
        this.volume.set(Math.round(el.volume * 100));
        this.isMuted.set(el.muted);
      },
    };

    for (const [event, handler] of Object.entries(handlers)) {
      el.addEventListener(event, handler);
      this.cleanupFns.push(() => el.removeEventListener(event, handler));
    }

    document.addEventListener('fullscreenchange', this.onFullscreenChange);

    el.volume = this.volume() / 100;
  }

  protected togglePlay(): void {
    const el: HTMLVideoElement = this.mediaEl();
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }

  protected toggleMute(): void {
    this.mediaEl().muted = !this.mediaEl().muted;
  }

  protected skipBackward(): void {
    this.mediaEl().currentTime = Math.max(0, this.mediaEl().currentTime - 10);
  }

  protected skipForward(): void {
    const el: HTMLVideoElement = this.mediaEl();
    el.currentTime = Math.min(el.duration || 0, el.currentTime + 10);
  }

  protected onProgressChange(value: number | null): void {
    if (value !== null) {
      const el: HTMLVideoElement = this.mediaEl();
      if (el.duration) {
        el.currentTime = (value / 100) * el.duration;
      }
    }
  }

  protected onVolumeChange(value: number | null): void {
    if (value !== null) {
      const el: HTMLVideoElement = this.mediaEl();
      el.volume = value / 100;
      el.muted = false;
    }
  }

  protected toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void this.mediaEl().requestFullscreen();
    }
  }
}
