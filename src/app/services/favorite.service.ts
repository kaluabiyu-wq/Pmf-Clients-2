import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { FavoriteRequest, FavoriteResponse } from '../model/favorite.model';

@Injectable({ providedIn: 'root' })
export class FavoriteService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

   private favoritesUrl(userId: number): string {
    return `${this.baseUrl}/users/${userId}/favorites`;
  }

  getByUser(userId: number): Observable<FavoriteResponse[]> {
    return this.http.get<FavoriteResponse[]>(this.favoritesUrl(userId));
  }

  getById(userId: number, id: number): Observable<FavoriteResponse> {
    return this.http.get<FavoriteResponse>(`${this.favoritesUrl(userId)}/${id}`);
  }

   check(userId: number, pharmacyId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.favoritesUrl(userId)}/check/${pharmacyId}`);
  }

  create(userId: number, request: FavoriteRequest): Observable<FavoriteResponse> {
    return this.http.post<FavoriteResponse>(this.favoritesUrl(userId), request);
  }

  delete(userId: number, id: number): Observable<void> {
    return this.http.delete<void>(`${this.favoritesUrl(userId)}/${id}`);
  }
}