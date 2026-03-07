import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { catchError, map, Observable, of, ReplaySubject, tap, throwError } from 'rxjs';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RegistrationConfigResponse,
  UserResponse,
  UserRole,
} from '@auth-lib/common';
import { AUTH_CONFIG, AuthConfig } from '../auth.config';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly config: AuthConfig = inject(AUTH_CONFIG);
  private readonly apiUrl = `${this.config.apiUrl}/auth`;
  private readonly currentUser = new ReplaySubject<UserResponse | undefined>(1);

  readonly isAuthenticated$: Observable<boolean> = this.currentUser.pipe(
    map((user: UserResponse | undefined) => !!user),
    catchError(() => of(false)),
  );
  readonly user$: Observable<UserResponse | undefined> = this.currentUser.asObservable();

  init(): Observable<UserResponse | undefined> {
    return this.http.get<UserResponse>(`${this.apiUrl}/me`).pipe(
      catchError((err: unknown): Observable<undefined> | never => {
        if (err instanceof HttpErrorResponse && err.status === 401) {
          return of(undefined);
        }

        return throwError(() => err);
      }),
      tap((user: UserResponse | undefined) => {
        this.currentUser.next(user);
      }),
    );
  }

  hasSuperAdminRights(user: UserResponse): boolean {
    return user.role === UserRole.SUPERADMIN;
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(tap((response: AuthResponse) => this.currentUser.next(response.user)));
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, data)
      .pipe(tap((response: AuthResponse) => this.currentUser.next(response.user)));
  }

  logout(): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.apiUrl}/logout`, {})
      .pipe(tap(() => this.currentUser.next(undefined)));
  }

  getRegistrationConfig(): Observable<RegistrationConfigResponse> {
    return this.http.get<RegistrationConfigResponse>(`${this.apiUrl}/registration-config`);
  }

  clearUser(): void {
    this.currentUser.next(undefined);
  }
}
