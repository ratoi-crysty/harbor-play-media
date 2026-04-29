import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CollectionModel, CreateCollectionRequest, MoveCollectionRequest, UpdateCollectionRequest } from '@harbor-play-media/shared-api';

@Injectable({ providedIn: 'root' })
export class CollectionApiService {
  private readonly http: HttpClient = inject(HttpClient);
  private readonly apiUrl = '/api/collections';

  getCollections(parentId?: string): Observable<CollectionModel[]> {
    const params: Record<string, string> = parentId ? { parentId } : {};
    return this.http.get<CollectionModel[]>(this.apiUrl, { params });
  }

  getCollection(id: string): Observable<CollectionModel> {
    return this.http.get<CollectionModel>(`${this.apiUrl}/${id}`);
  }

  createCollection(data: CreateCollectionRequest): Observable<CollectionModel> {
    return this.http.post<CollectionModel>(this.apiUrl, data);
  }

  updateCollection(id: string, data: UpdateCollectionRequest): Observable<CollectionModel> {
    return this.http.patch<CollectionModel>(`${this.apiUrl}/${id}`, data);
  }

  deleteCollection(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  moveCollection(id: string, newParentId: string | undefined): Observable<CollectionModel> {
    const body: MoveCollectionRequest = { parentId: newParentId };
    return this.http.post<CollectionModel>(`${this.apiUrl}/${id}/move`, body);
  }
}
