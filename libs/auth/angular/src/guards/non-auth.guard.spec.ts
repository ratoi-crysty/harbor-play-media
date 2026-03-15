import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { ReplaySubject } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { AuthService } from '../services/auth.service';
import { nonAuthGuard } from './non-auth.guard';

describe('nonAuthGuard', () => {
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
        (nonAuthGuard as () => ReturnType<typeof nonAuthGuard>)().subscribe((result) => resolve(result));
      });
    });
  }

  it('returns true when NOT authenticated', async () => {
    isAuthenticated$.next(false);
    const result = await runGuard();
    expect(result).toBe(true);
  });

  it('returns UrlTree(["/"]) when authenticated', async () => {
    isAuthenticated$.next(true);
    const result = await runGuard();
    expect(mockRouter.createUrlTree).toHaveBeenCalledWith(['/']);
    expect(result).toEqual({});
  });
});
