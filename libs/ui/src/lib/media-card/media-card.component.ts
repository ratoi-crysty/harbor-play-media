import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MediaModel } from '@harbor-play-media/shared-api';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'lib-media-card',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './media-card.component.html',
  styleUrl: './media-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MediaCardComponent {
  readonly media = input.required<MediaModel>();
  readonly duration = computed(() => {
    const seconds: number = this.media().duration;

    const h: number = Math.floor(seconds / 3600);
    const m: number = Math.floor((seconds % 3600) / 60);
    const s: number = seconds % 60;
    if (h > 0) {
      return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m}:${s.toString().padStart(2, '0')}`;
  });
}
