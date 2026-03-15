import { UserResponse } from '../requests/auth.interface';
import { UserRole } from '../models/user.enum';

const ROLE_HIERARCHY: Record<UserRole, UserRole[]> = {
  [UserRole.SUPERADMIN]: [UserRole.SUPERADMIN, UserRole.ADMIN, UserRole.USER],
  [UserRole.ADMIN]: [UserRole.ADMIN, UserRole.USER],
  [UserRole.USER]: [UserRole.USER],
};

export function isAllowed(user: UserResponse, roles: UserRole[]): boolean {
  return ROLE_HIERARCHY[user.role].some((role: UserRole): boolean => roles.includes(role));
}
