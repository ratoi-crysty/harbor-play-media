import { ChangeDetectionStrategy, Component, CUSTOM_ELEMENTS_SCHEMA, input, InputSignal } from '@angular/core';
import 'media-chrome';

@Component({
  selector: 'lib-media-chrome-player',
  imports: [],
  templateUrl: './media-chrome-player.component.html',
  styleUrl: './media-chrome-player.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MediaPlayerComponent {
  readonly type: InputSignal<"video" | "audio"> = input<'video' | 'audio'>('video');
  readonly url: InputSignal<string> = input.required<string>();
  readonly webVTT: InputSignal<string | undefined> = input<string>();
}
