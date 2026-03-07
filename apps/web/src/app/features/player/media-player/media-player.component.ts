import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { MediaModel } from '@harbor-play-media/shared-api';
import { MatIconModule } from '@angular/material/icon';
import { PlayerControlsComponent } from '../player-controls/player-controls.component';

@Component({
  selector: 'app-media-player',
  standalone: true,
  imports: [PlayerControlsComponent, MatIconModule],
  templateUrl: './media-player.component.html',
  styleUrl: './media-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaPlayerComponent implements OnDestroy {
  readonly media = input.required<MediaModel>();
  readonly autoStart = input<boolean>(false);

  videoEl: Signal<ElementRef<HTMLVideoElement> | undefined> = viewChild<ElementRef<HTMLVideoElement>>('mediaEl');

  protected readonly isPlaying = signal<boolean>(this.autoStart());
  protected readonly currentTime = signal<number>(0);
  protected readonly duration = signal<number>(0);
  protected readonly volume = signal<number>(80);
  protected readonly isMuted = signal<boolean>(false);
  protected readonly isFullscreen = signal<boolean>(false);
  protected readonly playPauseIcon = signal<'play_arrow' | 'pause' | null>(null);

  private cleanupFns: (() => void)[] = [];
  private iconTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      // Re-run when media changes to reset state
      this.media();
      this.isPlaying.set(this.autoStart());
      this.currentTime.set(0);
      this.duration.set(0);
    });
  }

  ngOnDestroy(): void {
    this.cleanupFns.forEach((fn: () => void) => fn());
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    if (this.iconTimeoutId !== null) {
      clearTimeout(this.iconTimeoutId);
    }
  }

  protected getVideoElement(): HTMLVideoElement {
    const element = this.videoEl()?.nativeElement;

    if (!element) {
      throw new Error('Unable to get video element from video element');
    }

    return element;
  }

  protected onVideoReady(): void {
    const el: HTMLVideoElement = this.getVideoElement();
    this.setupListeners(el);
    el.volume = this.volume() / 100;
    if (this.isPlaying() && navigator.userActivation.hasBeenActive) {
      el.play().catch(console.error);
    }
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
  }

  protected togglePlay(): void {
    const el: HTMLVideoElement = this.getVideoElement();
    if (el.paused) {
      void el.play();
      this.showIcon('play_arrow');
    } else {
      el.pause();
      this.showIcon('pause');
    }
  }

  private showIcon(icon: 'play_arrow' | 'pause'): void {
    if (this.iconTimeoutId !== null) {
      clearTimeout(this.iconTimeoutId);
      this.iconTimeoutId = null;
    }
    this.playPauseIcon.set(null);
    requestAnimationFrame(() => {
      this.playPauseIcon.set(icon);
      this.iconTimeoutId = setTimeout(() => {
        this.playPauseIcon.set(null);
        this.iconTimeoutId = null;
      }, 600);
    });
  }

  protected toggleMute(): void {
    this.getVideoElement().muted = !this.getVideoElement().muted;
  }

  protected skipBackward(): void {
    this.getVideoElement().currentTime = Math.max(0, this.getVideoElement().currentTime - 10);
  }

  protected skipForward(): void {
    const el: HTMLVideoElement = this.getVideoElement();
    el.currentTime = Math.min(el.duration || 0, el.currentTime + 10);
  }

  protected onProgressChange(value: number): void {
    const el: HTMLVideoElement = this.getVideoElement();
    if (el.duration) {
      el.currentTime = (value / 100) * el.duration;
    }
  }

  protected onVolumeChange(value: number): void {
    const el: HTMLVideoElement = this.getVideoElement();
    el.volume = value / 100;
    el.muted = false;
  }

  protected toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void this.getVideoElement().requestFullscreen();
    }
  }
}
