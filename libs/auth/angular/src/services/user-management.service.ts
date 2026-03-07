import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  UpdateUserRoleRequest,
  UserListItem,
  UserListResponse,
} from '@auth-lib/common';
import { AUTH_CONFIG, AuthConfig } from '../auth.config';

@Injectable({ providedIn: 'root' })
export class UserManagementService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly config: AuthConfig = inject(AUTH_CONFIG);
  private readonly apiUrl = `${this.config.apiUrl}/users`;

  getUsers(): Observable<UserListResponse> {
    return this.http.get<UserListResponse>(this.apiUrl);
  }

  updateRole(userId: number, request: UpdateUserRoleRequest): Observable<UserListItem> {
    return this.http.patch<UserListItem>(`${this.apiUrl}/${userId}/role`, request);
  }

  confirmUser(userId: number): Observable<UserListItem> {
    return this.http.post<UserListItem>(`${this.apiUrl}/${userId}/confirm`, {});
  }
}
