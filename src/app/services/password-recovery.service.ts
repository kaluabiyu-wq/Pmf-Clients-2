import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PasswordRecoveryService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/auth`;

  /** Always succeeds from the caller's point of view, so it cannot reveal which emails exist. */
  requestReset(email: string): Observable<void> {
    return this.http.post<void>(`${this.base}/forgot-password`, { email });
  }

  reset(email: string, token: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.base}/reset-password`, { email, token, newPassword });
  }
}