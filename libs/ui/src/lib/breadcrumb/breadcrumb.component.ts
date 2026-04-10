import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface BreadcrumbSegment {
  id: string;
  name: string;
}

@Component({
  selector: 'lib-breadcrumb',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  templateUrl: './breadcrumb.component.html',
  styleUrl: './breadcrumb.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  readonly segments = input<BreadcrumbSegment[]>([]);
}
