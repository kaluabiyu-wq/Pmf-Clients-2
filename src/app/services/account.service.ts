import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AccountProfile, ChangePasswordRequest, UpdateAccountRequest } from '../model/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/account`;

  get(): Observable<AccountProfile> {
    return this.http.get<AccountProfile>(this.baseUrl);
  }

  update(request: UpdateAccountRequest): Observable<AccountProfile> {
    return this.http.put<AccountProfile>(this.baseUrl, request);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/password`, request);
  }

 
  delete(password: string): Observable<void> {
    return this.http.delete<void>(this.baseUrl, { body: { password } });
  }
}