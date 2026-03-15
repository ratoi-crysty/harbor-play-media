import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  OnInit,
  Signal,
  signal,
  viewChild,
} from '@angular/core';
import { Router, RouterOutlet, Scroll } from '@angular/router';
import { SidebarComponent, PageHeaderComponent, NavItem } from '@harbor-play-media/ui';
import { filter } from 'rxjs';
import { AuthService } from '@auth-lib/angular';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, PageHeaderComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent implements OnInit {
  protected readonly STORAGE_KEY = 'shell.sidebar-open';
  protected router: Router = inject(Router);
  private readonly authService: AuthService = inject(AuthService);
  protected body: Signal<ElementRef<HTMLElement> | undefined> = viewChild<ElementRef<HTMLElement>>('mainBody');

  protected readonly navItems: NavItem[] = [
    { label: 'Library', icon: 'video_library', route: '/' },
    { label: 'Browse', icon: 'explore', route: '/browse' },
    { label: 'Upload', icon: 'upload', route: '/upload' },
    { label: 'Settings', icon: 'settings', route: '/settings' },
  ];

  // Start open on desktop, closed on mobile/tablet
  protected readonly sidebarOpen = signal<boolean>(this.getDefaultSideOpenValue());

  ngOnInit() {
    this.router.events.pipe(filter((event) => event instanceof Scroll)).subscribe({
      next: () => {
        this.body()?.nativeElement.scrollTo(0, 0);
      },
    });
  }

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

  protected onLogout(): void {
    this.authService.logout().subscribe({
      next: (): void => {
        this.router.navigate(['/auth/login']);
      },
    });
  }
}
