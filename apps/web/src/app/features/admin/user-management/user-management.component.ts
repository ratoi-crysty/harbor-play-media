import { Component, computed, inject, OnInit, Signal, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { ConfirmUserEvent, RoleChangeEvent, UserListComponent } from './user-list/user-list.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { AuthService, UserManagementService } from '@auth-lib/angular';
import { UserListItem, UserResponse } from '@auth-lib/common';
import { ErrorReportingService } from '../../../core/services/error-reporting.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [MatCardModule, MatProgressSpinnerModule, MatIconModule, UserListComponent],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss',
})
export class UserManagementComponent implements OnInit {
  private readonly userManagementService = inject(UserManagementService);
  private readonly authService = inject(AuthService);
  private readonly errorReporting = inject(ErrorReportingService);

  protected readonly users = signal<UserListItem[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<string>('');

  protected readonly user = toSignal(this.authService.user$);
  protected readonly currentUserId: Signal<number | undefined> = computed((): number | undefined => this.user()?.id);
  protected readonly isSuperadmin = computed(() => {
    const user: UserResponse | undefined = this.user();

    return !!user && this.authService.hasSuperAdminRights(user);
  });

  ngOnInit(): void {
    this.loadUsers();
  }

  private loadUsers(): void {
    this.loading.set(true);
    this.error.set('');

    this.userManagementService.getUsers().subscribe({
      next: (users) => {
        this.users.set(users);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.errorReporting.notify(err, 'load-users');
        this.error.set((err as { error?: { message?: string } }).error?.message || 'Failed to load users');
        this.loading.set(false);
      },
    });
  }

  onRoleChange(event: RoleChangeEvent): void {
    this.userManagementService.updateRole(event.userId, { role: event.newRole }).subscribe({
      next: (updatedUser: UserListItem) => {
        this.users.update((users: UserListItem[]) =>
          users.map((u: UserListItem) => (u.id === updatedUser.id ? updatedUser : u)),
        );
      },
      error: (err: unknown) => {
        this.errorReporting.notify(err, 'update-user-role');
        this.error.set((err as { error?: { message?: string } }).error?.message || 'Failed to update role');
      },
    });
  }

  onConfirmUser(event: ConfirmUserEvent): void {
    this.userManagementService.confirmUser(event.userId).subscribe({
      next: (updatedUser: UserListItem) => {
        this.users.update((users: UserListItem[]) =>
          users.map((u: UserListItem) => (u.id === updatedUser.id ? updatedUser : u)),
        );
      },
      error: (err: unknown) => {
        this.errorReporting.notify(err, 'confirm-user');
        this.error.set((err as { error?: { message?: string } }).error?.message || 'Failed to confirm user');
      },
    });
  }
}
