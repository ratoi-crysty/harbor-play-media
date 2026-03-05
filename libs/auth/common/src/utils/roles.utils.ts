import { UserResponse } from '../requests/auth.interface';
import { UserRole } from '../models/user.enum';

export function isAllowed(user: UserResponse, roles: UserRole[]) {
  const userRoles: UserRole[] = [];

  switch (user.role) {
    case UserRole.SUPERADMIN:
      userRoles.push(UserRole.SUPERADMIN);
    // fallthrough
    case UserRole.ADMIN:
      userRoles.push(UserRole.ADMIN);
    // fallthrough
    case UserRole.USER:
      userRoles.push(UserRole.USER);
  }

  return userRoles.some((role: UserRole): boolean => roles.includes(role));
}
