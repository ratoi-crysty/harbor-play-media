import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RegistrationMode, UserRole, UserStatus } from '@auth-lib/common';
import { describe, beforeEach, afterEach, it, expect } from 'vitest';
import { AUTH_CONFIG } from '../auth.config';
import { AuthService } from './auth.service';
import type { UserResponse, AuthResponse } from '@auth-lib/common';

const API_URL = 'http://localhost:3000/api';

function makeUser(overrides: Partial<UserResponse> = {}): UserResponse {
  return {
    id: 1,
    email: 'test@test.com',
    name: 'Test User',
    role: UserRole.USER,
    status: UserStatus.REGISTERED,
    ...overrides,
  };
}

function makeAuthResponse(user: UserResponse): AuthResponse {
  return { user, message: 'Success' };
}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: AUTH_CONFIG, useValue: { apiUrl: API_URL } },
      ],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('init()', () => {
    it('emits user on successful 200 response', () => {
      const user = makeUser();
      let emittedUser: UserResponse | undefined;

      service.init().subscribe((u) => (emittedUser = u));
      service.user$.subscribe((u) => (emittedUser = u));

      const req = httpMock.expectOne(`${API_URL}/auth/me`);
      req.flush(user);

      expect(emittedUser).toEqual(user);
    });

    it('emits undefined on 401 (unauthenticated but not error)', () => {
      let emittedUser: UserResponse | undefined = makeUser();

      service.init().subscribe((u) => (emittedUser = u));

      const req = httpMock.expectOne(`${API_URL}/auth/me`);
      req.flush({ message: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

      expect(emittedUser).toBeUndefined();
    });

    it('re-throws non-401 errors', () => {
      let errorThrown = false;

      service.init().subscribe({ error: () => (errorThrown = true) });

      const req = httpMock.expectOne(`${API_URL}/auth/me`);
      req.flush({ message: 'Server Error' }, { status: 500, statusText: 'Internal Server Error' });

      expect(errorThrown).toBe(true);
    });
  });

  describe('login()', () => {
    it('posts credentials and updates currentUser subject', () => {
      const user = makeUser();
      const response = makeAuthResponse(user);
      let emittedUser: UserResponse | undefined;

      service.user$.subscribe((u) => (emittedUser = u));
      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();

      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      expect(req.request.method).toBe('POST');
      req.flush(response);

      expect(emittedUser).toEqual(user);
    });
  });

  describe('register()', () => {
    it('posts data and updates currentUser subject', () => {
      const user = makeUser();
      const response = makeAuthResponse(user);
      let emittedUser: UserResponse | undefined;

      service.user$.subscribe((u) => (emittedUser = u));
      service.register({ email: 'test@test.com', password: 'pass', name: 'Test' }).subscribe();

      const req = httpMock.expectOne(`${API_URL}/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush(response);

      expect(emittedUser).toEqual(user);
    });
  });

  describe('logout()', () => {
    it('posts to logout endpoint and clears currentUser to undefined', () => {
      // First set a user
      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();
      const loginReq = httpMock.expectOne(`${API_URL}/auth/login`);
      loginReq.flush(makeAuthResponse(makeUser()));

      let emittedUser: UserResponse | undefined = makeUser();
      service.user$.subscribe((u) => (emittedUser = u));

      service.logout().subscribe();
      const req = httpMock.expectOne(`${API_URL}/auth/logout`);
      expect(req.request.method).toBe('POST');
      req.flush({ message: 'Logged out' });

      expect(emittedUser).toBeUndefined();
    });
  });

  describe('isAuthenticated$', () => {
    it('emits true when user present', () => {
      let isAuth = false;
      service.isAuthenticated$.subscribe((v) => (isAuth = v));

      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();
      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      req.flush(makeAuthResponse(makeUser()));

      expect(isAuth).toBe(true);
    });

    it('emits false when undefined', () => {
      let isAuth = true;
      service.clearUser();
      service.isAuthenticated$.subscribe((v) => (isAuth = v));
      expect(isAuth).toBe(false);
    });
  });

  describe('hasSuperAdminRights()', () => {
    it('returns true only for SUPERADMIN role', () => {
      expect(service.hasSuperAdminRights(makeUser({ role: UserRole.SUPERADMIN }))).toBe(true);
      expect(service.hasSuperAdminRights(makeUser({ role: UserRole.ADMIN }))).toBe(false);
      expect(service.hasSuperAdminRights(makeUser({ role: UserRole.USER }))).toBe(false);
    });
  });

  describe('clearUser()', () => {
    it('emits undefined from currentUser', () => {
      let emittedUser: UserResponse | undefined = makeUser();

      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();
      const req = httpMock.expectOne(`${API_URL}/auth/login`);
      req.flush(makeAuthResponse(makeUser()));

      service.user$.subscribe((u) => (emittedUser = u));
      service.clearUser();

      expect(emittedUser).toBeUndefined();
    });
  });
});
