import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, PageHeaderComponent, NavItem } from '@harbor-play-media/ui';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, PageHeaderComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  protected readonly STORAGE_KEY = 'shell.sidebar-open';

  protected readonly navItems: NavItem[] = [
    { label: 'Library', icon: 'video_library', route: '/' },
    { label: 'Browse', icon: 'explore', route: '/browse' },
    { label: 'Upload', icon: 'upload', route: '/upload' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  // Start open on desktop, closed on mobile/tablet
  protected readonly sidebarOpen = signal<boolean>(this.getDefaultSideOpenValue());

  protected toggleSidebar(): void {
    this.updateSidebar(!this.sidebarOpen());
  }

  protected closeSidebar(): void {
    this.updateSidebar(false);
  }

  protected onNavItemClick(): void {
    // On mobile/tablet, close the sidebar after navigating
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }

  protected getDefaultSideOpenValue(): boolean {
    if (window.innerWidth < 1024) {
      return false;
    }

    const value = localStorage.getItem(this.STORAGE_KEY);

    if (value === null) {
      return true;
    }

    return JSON.parse(value);
  }

  protected updateSidebar(value: boolean): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(value));
    this.sidebarOpen.set(value);
  }
}
