import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ShareModel, ShareResourceType } from '@harbor-play-media/shared-api';

@Injectable({ providedIn: 'root' })
export class ShareApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl = '/api/shares';

  shareResource(
    resourceType: ShareResourceType,
    resourceId: string,
    email: string,
  ): Observable<ShareModel> {
    return this.http.post<ShareModel>(this.apiUrl, { resourceType, resourceId, email });
  }

  getSharesForResource(
    resourceType: ShareResourceType,
    resourceId: string,
  ): Observable<ShareModel[]> {
    return this.http.get<ShareModel[]>(`${this.apiUrl}/resource/${resourceType}/${resourceId}`);
  }

  revokeShare(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getSharedWithMe(): Observable<ShareModel[]> {
    return this.http.get<ShareModel[]>(`${this.apiUrl}/shared-with-me`);
  }
}
