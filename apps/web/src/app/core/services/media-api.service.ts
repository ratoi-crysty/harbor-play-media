import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MediaModel, UpdateMediaRequest } from '@harbor-play-media/shared-api';

export interface UploadParams {
  title: string;
  description: string;
  mediaFile: File;
  thumbnailFile?: File;
  collectionId?: string;
  tags?: string[];
}

@Injectable({ providedIn: 'root' })
export class MediaApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly document: Document = inject(DOCUMENT);
  private readonly apiUrl = '/api/media';

  getAll(): Observable<MediaModel[]> {
    return this.http.get<MediaModel[]>(this.apiUrl);
  }

  getById(id: string): Observable<MediaModel> {
    return this.http.get<MediaModel>(`${this.apiUrl}/${id}`);
  }

  upload(params: UploadParams): Observable<HttpEvent<MediaModel>> {
    const formData: FormData = new FormData();
    formData.append('title', params.title);
    formData.append('description', params.description);
    formData.append('mediaAsset', params.mediaFile);
    if (params.thumbnailFile) {
      formData.append('thumbnailAsset', params.thumbnailFile);
    }
    if (params.collectionId) {
      formData.append('collectionId', params.collectionId);
    }
    if (params.tags && params.tags.length > 0) {
      formData.append('tags', JSON.stringify(params.tags));
    }

    const req: HttpRequest<FormData> = new HttpRequest('POST', this.apiUrl, formData, {
      reportProgress: true,
    });

    return this.http.request<MediaModel>(req);
  }

  update(id: string, data: UpdateMediaRequest): Observable<MediaModel> {
    return this.http.patch<MediaModel>(`${this.apiUrl}/${id}`, data);
  }

  download(id: string): void {
    const link: HTMLAnchorElement = this.document.createElement('a');
    link.href = `${this.apiUrl}/${id}/download`;
    link.download = '';
    link.click();
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
