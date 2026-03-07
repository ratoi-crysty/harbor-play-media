import { HttpErrorResponse, HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, beforeEach, it, expect, vi } from 'vitest';
import { AuthService } from './services/auth.service';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let mockAuthService: { clearUser: ReturnType<typeof vi.fn> };
  let mockRouter: { navigate: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    mockAuthService = { clearUser: vi.fn() };
    mockRouter = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    });
  });

  function runInterceptor(
    req: HttpRequest<unknown>,
    next: HttpHandlerFn,
  ): Promise<unknown> {
    return new Promise((resolve, reject) => {
      TestBed.runInInjectionContext(() => {
        authInterceptor(req, next).subscribe({ next: resolve, error: reject });
      });
    });
  }

  it('clones request with withCredentials: true', async () => {
    const req = new HttpRequest('GET', '/api/data');
    let capturedReq: HttpRequest<unknown> | null = null;

    const next: HttpHandlerFn = (r) => {
      capturedReq = r as HttpRequest<unknown>;
      return of(new HttpResponse({ status: 200 }));
    };

    await runInterceptor(req, next);

    expect(capturedReq).not.toBeNull();
    expect((capturedReq as unknown as HttpRequest<unknown>).withCredentials).toBe(true);
  });

  it('on 401 non-auth URL: calls authService.clearUser() and navigates to /login', async () => {
    const req = new HttpRequest('GET', '/api/data');
    const error = new HttpErrorResponse({ status: 401, url: '/api/data' });
    const next: HttpHandlerFn = () => throwError(() => error);

    await runInterceptor(req, next).catch(() => undefined);

    expect(mockAuthService.clearUser).toHaveBeenCalled();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('on non-401 error: re-throws without navigating', async () => {
    const req = new HttpRequest('GET', '/api/data');
    const error = new HttpErrorResponse({ status: 500, url: '/api/data' });
    const next: HttpHandlerFn = () => throwError(() => error);

    let thrownError: unknown;
    await runInterceptor(req, next).catch((e) => (thrownError = e));

    expect(thrownError).toBe(error);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockAuthService.clearUser).not.toHaveBeenCalled();
  });

  it('on auth URL 401: re-throws without navigating', async () => {
    const req = new HttpRequest('GET', '/api/auth/login');
    const error = new HttpErrorResponse({ status: 401, url: '/api/auth/login' });
    const next: HttpHandlerFn = () => throwError(() => error);

    let thrownError: unknown;
    await runInterceptor(req, next).catch((e) => (thrownError = e));

    expect(thrownError).toBe(error);
    expect(mockRouter.navigate).not.toHaveBeenCalled();
    expect(mockAuthService.clearUser).not.toHaveBeenCalled();
  });
});
