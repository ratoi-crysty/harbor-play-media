import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, PageHeaderComponent, NavItem } from '@harbor-play-media/ui';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, PageHeaderComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  protected readonly navItems: NavItem[] = [
    { label: 'Library', icon: 'video_library', route: '/' },
    { label: 'Browse', icon: 'explore', route: '/browse' },
    { label: 'Upload', icon: 'upload', route: '/upload' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  // Start open on desktop, closed on mobile/tablet
  protected readonly sidebarOpen = signal<boolean>(
    typeof window !== 'undefined' && window.innerWidth >= 1024
  );

  protected toggleSidebar(): void {
    this.sidebarOpen.update((v: boolean) => !v);
  }

  protected closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  protected onNavItemClick(): void {
    // On mobile/tablet, close the sidebar after navigating
    if (window.innerWidth < 1024) {
      this.sidebarOpen.set(false);
    }
  }
}
