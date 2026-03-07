import { AfterViewInit, ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
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
  host: {
    '[class.open]': 'open()',
    '[class.no-transition]': '!ready()',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements AfterViewInit {
  readonly navItems = input<NavItem[]>([]);
  readonly open = input<boolean>(true);
  readonly navItemClick = output<void>();
  readonly logout = output<void>();

  protected readonly ready = signal<boolean>(false);

  ngAfterViewInit(): void {
    // Wait one frame before enabling transitions so the initial open state
    // is painted without animating in from the closed position.
    setTimeout(() => this.ready.set(true));
  }

  protected onNavItemClick(): void {
    this.navItemClick.emit();
  }

  protected onLogout(): void {
    this.logout.emit();
  }
}
