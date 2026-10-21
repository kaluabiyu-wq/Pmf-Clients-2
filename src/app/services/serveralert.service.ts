import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PagedResponse } from '../model/location.model';
import { AlertCount, ServerAlert } from '../model/serverAlert.model';

@Injectable({ providedIn: 'root' })
export class ServerAlertService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/alerts`;

  getMine(query: { page?: number; pageSize?: number; isRead?: boolean } = {}): Observable<PagedResponse<ServerAlert>> {
    let params = new HttpParams();
    if (query.page !== undefined) params = params.set('page', query.page);
    if (query.pageSize !== undefined) params = params.set('pageSize', query.pageSize);
    if (query.isRead !== undefined) params = params.set('isRead', query.isRead);
    return this.http.get<PagedResponse<ServerAlert>>(this.baseUrl, { params });
  }

  
  markRead(id: number): Observable<void> {
    return this.http.patch<void>(`${this.baseUrl}/${id}/read`, {});
  }

  /** One cheap number for the dashboard badge. */
  getUnreadCount(): Observable<AlertCount> {
    return this.http.get<AlertCount>(`${this.baseUrl}/unread-count`);
  }

  /** Marks every alert read; the response says how many actually changed. */
  markAllRead(): Observable<AlertCount> {
    return this.http.post<AlertCount>(`${this.baseUrl}/read-all`, {});
  }
}