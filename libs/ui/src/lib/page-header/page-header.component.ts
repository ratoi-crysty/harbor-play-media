import { Component, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'lib-page-header',
  standalone: true,
  imports: [MatIconModule, MatInputModule, MatFormFieldModule],
  templateUrl: './page-header.component.html',
  styleUrl: './page-header.component.scss',
})
export class PageHeaderComponent {
  protected searchQuery = signal<string>('');

  protected onSearch(event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
  }
}
