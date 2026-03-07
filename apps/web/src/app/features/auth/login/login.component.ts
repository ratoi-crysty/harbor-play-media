import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@auth-lib/angular';
import { LoginRequest } from '@auth-lib/common';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);

  readonly formData = signal<LoginRequest>({ email: '', password: '' });
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal<boolean>(false);

  updateField(field: keyof LoginRequest, value: string): void {
    this.formData.update((f: LoginRequest) => ({ ...f, [field]: value }));
    this.error.set(null);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v: boolean) => !v);
  }

  submit(): void {
    if (this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.login(this.formData()).subscribe({
      next: (): void => {
        this.router.navigate(['/']);
      },
      error: (): void => {
        this.error.set('Invalid email or password. Please try again.');
        this.loading.set(false);
      },
    });
  }
}
