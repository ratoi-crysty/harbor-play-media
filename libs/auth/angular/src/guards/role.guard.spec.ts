import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { UserRole, UserStatus } from '@auth-lib/common';
import type { UserResponse } from '@auth-lib/common';
import { AuthService } from '../services/auth.service';
import { adminGuard, superadminGuard } from './role.guard';

function makeUser(role: UserRole): UserResponse {
  return { id: 1, email: 'test@test.com', name: 'Test', role, status: UserStatus.REGISTERED };
}

describe('role guards', () => {
  let user$: ReplaySubject<UserResponse | undefined>;
  let mockRouter: { createUrlTree: ReturnType<typeof vi.fn>; navigate: ReturnType<typeof vi.fn> };
  let mockAuthService: Partial<AuthService>;
  const fakeUrlTree = {} as UrlTree;

  beforeEach(() => {
    user$ = new ReplaySubject<UserResponse | undefined>(1);

    mockRouter = {
      createUrlTree: vi.fn().mockReturnValue(fakeUrlTree),
      navigate: vi.fn(),
    };

    mockAuthService = {
      user$: user$.asObservable(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  function runGuard(guardFn: () => ReturnType<typeof adminGuard>): Promise<true | UrlTree> {
    return new Promise((resolve) => {
      TestBed.runInInjectionContext(() => {
        (guardFn()as () => ReturnType<typeof adminGuard>)().subscribe((result) => resolve(result));
      });
    });
  }

  describe('adminGuard', () => {
    it('returns true for ADMIN user', async () => {
      user$.next(makeUser(UserRole.ADMIN));
      const result = await runGuard(adminGuard);
      expect(result).toBe(true);
    });

    it('returns true for SUPERADMIN user (inherits admin)', async () => {
      user$.next(makeUser(UserRole.SUPERADMIN));
      const result = await runGuard(adminGuard);
      expect(result).toBe(true);
    });

    it('returns UrlTree(["/"]) for USER', async () => {
      user$.next(makeUser(UserRole.USER));
      const result = await runGuard(adminGuard);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
      expect(result).toEqual(fakeUrlTree);
    });
  });

  describe('superadminGuard', () => {
    it('returns true for SUPERADMIN', async () => {
      user$.next(makeUser(UserRole.SUPERADMIN));
      const result = await runGuard(superadminGuard);
      expect(result).toBe(true);
    });

    it('returns UrlTree(["/"]) for ADMIN', async () => {
      user$.next(makeUser(UserRole.ADMIN));
      const result = await runGuard(superadminGuard);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
      expect(result).toEqual(fakeUrlTree);
    });

    it('returns UrlTree(["/"]) for USER', async () => {
      user$.next(makeUser(UserRole.USER));
      const result = await runGuard(superadminGuard);
      expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
      expect(result).toEqual(fakeUrlTree);
    });
  });
});
