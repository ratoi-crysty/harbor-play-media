import { Component, input, output } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { FormsModule } from '@angular/forms';
import { UserListItem, UserRole, UserStatus } from '@auth-lib/common';

export interface RoleChangeEvent {
  userId: number;
  newRole: UserRole;
}

export interface ConfirmUserEvent {
  userId: number;
}

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    DatePipe,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatChipsModule,
  ],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss',
})
export class UserListComponent {
  readonly users = input.required<UserListItem[]>();
  readonly currentUserId = input.required<number>();
  readonly canChangeRoles = input<boolean>(false);

  readonly roleChange = output<RoleChangeEvent>();
  readonly confirmUser = output<ConfirmUserEvent>();

  readonly displayedColumns: string[] = ['name', 'email', 'role', 'status', 'createdAt', 'actions'];
  readonly roles: UserRole[] = [UserRole.USER, UserRole.ADMIN, UserRole.SUPERADMIN];
  readonly UserStatus = UserStatus;

  getRoleLabel(role: UserRole): string {
    const labels: Record<UserRole, string> = {
      [UserRole.USER]: 'User',
      [UserRole.ADMIN]: 'Admin',
      [UserRole.SUPERADMIN]: 'Super Admin',
    };
    return labels[role];
  }

  getStatusLabel(status: UserStatus): string {
    const labels: Record<UserStatus, string> = {
      [UserStatus.REGISTERED]: 'Active',
      [UserStatus.AWAITING_CONFIRMATION]: 'Pending',
    };
    return labels[status];
  }

  onRoleChange(userId: number, newRole: UserRole): void {
    this.roleChange.emit({ userId, newRole });
  }

  onConfirmUser(userId: number): void {
    this.confirmUser.emit({ userId });
  }
}
