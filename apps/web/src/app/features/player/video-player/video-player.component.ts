import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  signal,
  ViewChild,
} from '@angular/core';
import { MediaModel } from '@harbor-play-media/shared-api';
import { PlayerControlsComponent } from '../player-controls/player-controls.component';

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [PlayerControlsComponent],
  templateUrl: './video-player.component.html',
  styleUrl: './video-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VideoPlayerComponent implements OnDestroy {
  readonly media = input.required<MediaModel>();
  readonly autoStart = input<boolean>(false);

  @ViewChild('mediaEl') videoEl!: ElementRef<HTMLVideoElement>;

  protected readonly isPlaying = signal<boolean>(false);
  protected readonly currentTime = signal<number>(0);
  protected readonly duration = signal<number>(0);
  protected readonly volume = signal<number>(80);
  protected readonly isMuted = signal<boolean>(false);
  protected readonly isFullscreen = signal<boolean>(false);

  private cleanupFns: (() => void)[] = [];

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
  }

  protected onVideoReady(): void {
    const el: HTMLVideoElement = this.videoEl.nativeElement;
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
    const el: HTMLVideoElement = this.videoEl.nativeElement;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }

  protected toggleMute(): void {
    this.videoEl.nativeElement.muted = !this.videoEl.nativeElement.muted;
  }

  protected skipBackward(): void {
    this.videoEl.nativeElement.currentTime = Math.max(0, this.videoEl.nativeElement.currentTime - 10);
  }

  protected skipForward(): void {
    const el: HTMLVideoElement = this.videoEl.nativeElement;
    el.currentTime = Math.min(el.duration || 0, el.currentTime + 10);
  }

  protected onProgressChange(value: number): void {
    const el: HTMLVideoElement = this.videoEl.nativeElement;
    if (el.duration) {
      el.currentTime = (value / 100) * el.duration;
    }
  }

  protected onVolumeChange(value: number): void {
    const el: HTMLVideoElement = this.videoEl.nativeElement;
    el.volume = value / 100;
    el.muted = false;
  }

  protected toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void this.videoEl.nativeElement.requestFullscreen();
    }
  }
}
