import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';

export interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'lib-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  host: { '[class.open]': 'open()' },
})
export class SidebarComponent {
  readonly navItems = input<NavItem[]>([]);
  readonly open = input<boolean>(true);
  readonly navItemClick = output<void>();

  protected onNavItemClick(): void {
    this.navItemClick.emit();
  }
}
