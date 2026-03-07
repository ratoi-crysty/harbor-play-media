import { describe, expect, it } from 'vitest';
import { UserRole, UserStatus } from '../models/user.enum';
import { UserResponse } from '../requests/auth.interface';
import { isAllowed } from './roles.utils';

function makeUser(role: UserRole): UserResponse {
  return { id: 1, email: 'test@test.com', name: 'Test', role, status: UserStatus.REGISTERED };
}

describe('isAllowed', () => {
  describe('SUPERADMIN user', () => {
    const user = makeUser(UserRole.SUPERADMIN);

    it('can access SUPERADMIN role', () => {
      expect(isAllowed(user, [UserRole.SUPERADMIN])).toBe(true);
    });

    it('can access ADMIN role', () => {
      expect(isAllowed(user, [UserRole.ADMIN])).toBe(true);
    });

    it('can access USER role', () => {
      expect(isAllowed(user, [UserRole.USER])).toBe(true);
    });
  });

  describe('ADMIN user', () => {
    const user = makeUser(UserRole.ADMIN);

    it('can access ADMIN role', () => {
      expect(isAllowed(user, [UserRole.ADMIN])).toBe(true);
    });

    it('can access USER role', () => {
      expect(isAllowed(user, [UserRole.USER])).toBe(true);
    });

    it('cannot access SUPERADMIN role', () => {
      expect(isAllowed(user, [UserRole.SUPERADMIN])).toBe(false);
    });
  });

  describe('USER user', () => {
    const user = makeUser(UserRole.USER);

    it('can access USER role', () => {
      expect(isAllowed(user, [UserRole.USER])).toBe(true);
    });

    it('cannot access ADMIN role', () => {
      expect(isAllowed(user, [UserRole.ADMIN])).toBe(false);
    });

    it('cannot access SUPERADMIN role', () => {
      expect(isAllowed(user, [UserRole.SUPERADMIN])).toBe(false);
    });
  });

  it('returns false when roles array is empty', () => {
    expect(isAllowed(makeUser(UserRole.SUPERADMIN), [])).toBe(false);
  });

  it('returns false when no matching role', () => {
    expect(isAllowed(makeUser(UserRole.USER), [UserRole.ADMIN, UserRole.SUPERADMIN])).toBe(false);
  });
});
