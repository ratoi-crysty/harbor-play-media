import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { CollectionModel } from '@harbor-play-media/shared-api';

@Component({
  selector: 'lib-collection-card',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './collection-card.component.html',
  styleUrl: './collection-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CollectionCardComponent {
  readonly collection = input.required<CollectionModel>();

  protected readonly hasThumbnail = computed<boolean>(() => !!this.collection().thumbnailUrl);

  protected readonly itemLabel = computed<string>(() => {
    const count: number = this.collection().itemCount;
    return count === 1 ? '1 item' : `${count} items`;
  });
}
