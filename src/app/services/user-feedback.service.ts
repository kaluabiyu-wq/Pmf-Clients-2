import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PagedFeedbackQuery, UserFeedbackRequest, UserFeedbackResponse } from '../model/userFeedback.model';
import { PagedResponse } from '../model/medicine.model';

@Injectable({ providedIn: 'root' })
export class UserFeedbackService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  private feedbackUrl(userId: number): string {
    return `${this.baseUrl}/users/${userId}/feedback`;
  }

 
  getByUserAndInventory(userId: number, inventoryId: number): Observable<UserFeedbackResponse> {
    return this.http.get<UserFeedbackResponse>(`${this.feedbackUrl(userId)}/${inventoryId}`);
  }

  create(userId: number, request: UserFeedbackRequest): Observable<UserFeedbackResponse> {
    return this.http.post<UserFeedbackResponse>(this.feedbackUrl(userId), request);
  }

  getAll(query: PagedFeedbackQuery = {}): Observable<PagedResponse<UserFeedbackResponse>> {
    let params = new HttpParams();
 
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    if (query.orderBy) params = params.set('orderBy', query.orderBy);
    if (query.descending !== undefined) params = params.set('descending', query.descending);
 
    return this.http.get<PagedResponse<UserFeedbackResponse>>(`${this.baseUrl}/feedback`, {
      params,
    });
  }
}