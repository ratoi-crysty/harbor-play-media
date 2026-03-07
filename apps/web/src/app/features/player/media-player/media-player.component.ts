import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  OnInit,
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
export class MediaPlayerComponent implements OnInit, OnDestroy {
  readonly media = input.required<MediaModel>();
  readonly autoStart = input<boolean>(false);

  protected readonly videoEl: Signal<ElementRef<HTMLVideoElement> | undefined> =
    viewChild<ElementRef<HTMLVideoElement>>('mediaEl');
  protected readonly isPlaying = signal<boolean>(this.autoStart());
  protected readonly currentTime = signal<number>(0);
  protected readonly duration = signal<number>(0);
  protected readonly volume = signal<number>(80);
  protected readonly isMuted = signal<boolean>(false);
  protected readonly isFullscreen = signal<boolean>(false);
  protected readonly playPauseIcon = signal<'play_arrow' | 'pause' | null>(null);

  private iconTimeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    effect(() => {
      // Re-run when media changes to reset state
      this.media();
      // TODO: Re-enable this when production ready
      // this.isPlaying.set(this.autoStart());
      this.currentTime.set(0);
      this.duration.set(this.media().duration);
    });
  }

  ngOnInit() {
    this.setupListeners();
  }

  ngOnDestroy(): void {
    document.removeEventListener('fullscreenchange', this.onFullscreenChange);
    if (this.iconTimeoutId !== null) {
      clearTimeout(this.iconTimeoutId);
    }
  }

  protected getMediaElement(): HTMLVideoElement {
    const element = this.videoEl()?.nativeElement;

    if (!element) {
      throw new Error('Unable to get video element from video element');
    }

    return element;
  }

  protected onVideoReady(): void {
    const el: HTMLVideoElement = this.getMediaElement();

    el.volume = this.volume() / 100;

    if (this.isPlaying() && navigator.userActivation.hasBeenActive) {
      el.play().catch(console.error);
    }
  }

  private readonly onFullscreenChange = (): void => {
    this.isFullscreen.set(!!document.fullscreenElement);
  };

  protected updateCurrentTime() {
    const el: HTMLVideoElement = this.getMediaElement();
    this.currentTime.set(el.currentTime);
  }

  protected play() {
    this.isPlaying.set(true);
  }

  protected pause() {
    this.isPlaying.set(false);
  }

  changeDuration() {
    const el: HTMLVideoElement = this.getMediaElement();

    this.duration.set(isFinite(el.duration) ? el.duration : 0);
  }

  changeVolume() {
    const el: HTMLVideoElement = this.getMediaElement();

    this.volume.set(Math.round(el.volume * 100));
    this.isMuted.set(el.muted);
  }

  private setupListeners(): void {
    document.addEventListener('fullscreenchange', this.onFullscreenChange);
  }

  protected togglePlay(): void {
    const el: HTMLVideoElement = this.getMediaElement();
    if (el.paused) {
      void el.play();
      this.showIconEffect('play_arrow');
    } else {
      el.pause();
      this.showIconEffect('pause');
    }
  }

  private showIconEffect(icon: 'play_arrow' | 'pause'): void {
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

  protected onKeydown(event: KeyboardEvent): void {
    const el: HTMLVideoElement = this.getMediaElement();
    const stepSize = 5;

    switch (event.key) {
      case 'ArrowLeft':
        event.preventDefault();
        el.currentTime = Math.max(0, el.currentTime - stepSize);
        break;
      case 'ArrowRight':
        event.preventDefault();
        el.currentTime = Math.min(el.duration || 0, el.currentTime + stepSize);
        break;
      case ' ':
        event.preventDefault();
        this.togglePlay();
    }
  }

  protected toggleMute(): void {
    this.getMediaElement().muted = !this.getMediaElement().muted;
  }

  protected skipBackward(): void {
    this.getMediaElement().currentTime = Math.max(0, this.getMediaElement().currentTime - 10);
  }

  protected skipForward(): void {
    const el: HTMLVideoElement = this.getMediaElement();
    el.currentTime = Math.min(el.duration || 0, el.currentTime + 10);
  }

  protected onProgressChange(value: number): void {
    console.log('onProgressChange');
    const el: HTMLVideoElement = this.getMediaElement();
    if (el.duration) {
      el.currentTime = (value / 100) * el.duration;
    }
  }

  protected onVolumeChange(value: number): void {
    const el: HTMLVideoElement = this.getMediaElement();
    el.volume = value / 100;
    el.muted = false;
  }

  protected toggleFullscreen(): void {
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else {
      void this.getMediaElement().requestFullscreen();
    }
  }
}
