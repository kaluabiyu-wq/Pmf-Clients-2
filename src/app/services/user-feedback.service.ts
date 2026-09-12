import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserFeedbackRequest, UserFeedbackResponse } from '../model/userFeedback.model';

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
}