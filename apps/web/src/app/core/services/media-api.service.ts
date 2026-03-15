import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MediaModel } from '@harbor-play-media/shared-api';

@Injectable({ providedIn: 'root' })
export class MediaApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl = '/api/media';

  getAll(): Observable<MediaModel[]> {
    return this.http.get<MediaModel[]>(this.apiUrl);
  }

  getById(id: string): Observable<MediaModel> {
    return this.http.get<MediaModel>(`${this.apiUrl}/${id}`);
  }

  upload(title: string, description: string, mediaFile: File, thumbnailFile?: File): Observable<MediaModel> {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    formData.append('mediaAsset', mediaFile);
    if (thumbnailFile) {
      formData.append('thumbnailAsset', thumbnailFile);
    }
    return this.http.post<MediaModel>(this.apiUrl, formData);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
