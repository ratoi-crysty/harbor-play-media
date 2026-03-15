import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MediaModel } from '@harbor-play-media/shared-api';
import { formatFileSize } from '../../../core/mock-data';

@Component({
  selector: 'app-player-info',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatChipsModule],
  templateUrl: './player-info.component.html',
  styleUrl: './player-info.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlayerInfoComponent {
  readonly media = input.required<MediaModel>();

  protected formatFileSize(bytes: number): string {
    return formatFileSize(bytes);
  }
}
