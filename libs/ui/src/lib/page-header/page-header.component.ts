import { Component, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'lib-page-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  readonly sidebarOpen = input<boolean>(true);
  readonly menuToggle = output<void>();

  protected searchQuery = signal<string>('');

  protected onMenuToggle(): void {
    this.menuToggle.emit();
  }

  protected onSearch(event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }
}
