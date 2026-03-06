import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent, NavItem } from '@harbor-play-media/ui';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent],
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
}
