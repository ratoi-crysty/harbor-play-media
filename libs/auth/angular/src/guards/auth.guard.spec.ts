import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { of, ReplaySubject } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let isAuthenticated$: ReplaySubject<boolean>;
  let mockRouter: { createUrlTree: ReturnType<typeof vi.fn>; navigate: ReturnType<typeof vi.fn> };
  let mockAuthService: Partial<AuthService>;

  beforeEach(() => {
    isAuthenticated$ = new ReplaySubject<boolean>(1);
    const fakeUrlTree = {} as UrlTree;

    mockRouter = {
      createUrlTree: vi.fn().mockReturnValue(fakeUrlTree),
      navigate: vi.fn(),
    };

    mockAuthService = {
      isAuthenticated$: isAuthenticated$.asObservable(),
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  function runGuard(): Promise<true | UrlTree> {
    return new Promise((resolve) => {
      TestBed.runInInjectionContext(() => {
        (authGuard as () => ReturnType<typeof authGuard>)().subscribe((result) => resolve(result));
      });
    });
  }

  it('returns true when authenticated', async () => {
    isAuthenticated$.next(true);
    const result = await runGuard();
    expect(result).toBe(true);
  });

  it('returns UrlTree(["/auth/login"]) when not authenticated', async () => {
    isAuthenticated$.next(false);
    const result = await runGuard();
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/auth/login']);
    expect(result).toEqual({});
  });
});
