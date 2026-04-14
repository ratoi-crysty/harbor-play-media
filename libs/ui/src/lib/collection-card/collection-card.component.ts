import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { CollectionModel } from '@harbor-play-media/shared-api';

@Component({
  selector: 'lib-collection-card',
  standalone: true,
  imports: [RouterLink, MatIconModule, MatButtonModule, MatMenuModule],
  templateUrl: './collection-card.component.html',
  styleUrl: './collection-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionCardComponent {
  readonly collection = input.required<CollectionModel>();

  readonly renamed = output<void>();
  readonly deleted = output<void>();
  readonly moved = output<void>();

  protected readonly hasThumbnail = computed<boolean>(() => !!this.collection().thumbnailUrl);

  protected readonly itemLabel = computed<string>(() => {
    const count: number = this.collection().itemCount;
    return count === 1 ? '1 item' : `${count} items`;
  });

  protected onMenuClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
  }
}
