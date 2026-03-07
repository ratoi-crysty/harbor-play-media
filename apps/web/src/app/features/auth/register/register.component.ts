import { ChangeDetectionStrategy, Component, Signal, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { Observable, catchError, map, of } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '@auth-lib/angular';
import { RegisterRequest, RegistrationConfigResponse, RegistrationMode } from '@auth-lib/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatIconModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterComponent {
  private readonly authService: AuthService = inject(AuthService);
  private readonly router: Router = inject(Router);

  readonly formData = signal<RegisterRequest>({ name: '', email: '', password: '' });
  readonly loading = signal<boolean>(false);
  readonly error = signal<string | null>(null);
  readonly registered = signal<boolean>(false);
  readonly showPassword = signal<boolean>(false);

  readonly registrationMode: Signal<RegistrationMode | null> = toSignal(
    this.authService.getRegistrationConfig().pipe(
      map((config: RegistrationConfigResponse): RegistrationMode => config.mode),
      catchError((): Observable<null> => {
        this.error.set('Could not load registration settings. Please try again later.');
        return of(null);
      }),
    ),
    { initialValue: null },
  );

  protected readonly RegistrationMode: typeof RegistrationMode = RegistrationMode;

  updateField(field: keyof RegisterRequest, event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;
    this.formData.update((f: RegisterRequest) => ({ ...f, [field]: value }));
    this.error.set(null);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update((v: boolean) => !v);
  }

  submit(): void {
    if (this.loading()) return;

    this.loading.set(true);
    this.error.set(null);

    this.authService.register(this.formData()).subscribe({
      next: (): void => {
        if (this.registrationMode() === RegistrationMode.CONFIRMATION) {
          this.registered.set(true);
          this.loading.set(false);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: (): void => {
        this.error.set('Registration failed. Please check your details and try again.');
        this.loading.set(false);
      },
    });
  }
}
