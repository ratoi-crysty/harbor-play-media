import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateInvitationRequest, InvitationListResponse, InvitationResponse } from '@auth-lib/common';
import { AUTH_CONFIG, AuthConfig } from '../auth.config';

@Injectable({ providedIn: 'root' })
export class InvitationService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly config: AuthConfig = inject(AUTH_CONFIG);
  private readonly apiUrl = `${this.config.apiUrl}/invitations`;

  getInvitations(): Observable<InvitationListResponse> {
    return this.http.get<InvitationListResponse>(this.apiUrl);
  }

  createInvitation(request: CreateInvitationRequest): Observable<InvitationResponse> {
    return this.http.post<InvitationResponse>(this.apiUrl, request);
  }

  deleteInvitation(id: number): Observable<{ success: boolean }> {
    return this.http.delete<{ success: boolean }>(`${this.apiUrl}/${id}`);
  }
}
