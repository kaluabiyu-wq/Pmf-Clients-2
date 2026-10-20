import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AccountStatus,AdminOverview,
  AdminUserCreateRequest,AdminUserCreated,
  AdminUserDetail,AdminUserQuery,
  AuditEntry,AuditQuery,
  RoleSummary,SystemHealth,
} from '../model/admin.model';
import { PagedResponse } from '../model/user.model';

/** Everything the SysAdmin area calls. Every route needs the SysAdmin role on the API side. */
@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.apiBaseUrl}/admin`;

  // ----- Users -----

  listUsers(query: AdminUserQuery = {}): Observable<PagedResponse<AdminUserDetail['user']>> {
    return this.http.get<PagedResponse<AdminUserDetail['user']>>(`${this.base}/users`, {
      params: this.toParams(query),
    });
  }

  getUser(id: number): Observable<AdminUserDetail> {
    return this.http.get<AdminUserDetail>(`${this.base}/users/${id}`);
  }

  createUser(request: AdminUserCreateRequest): Observable<AdminUserCreated> {
    return this.http.post<AdminUserCreated>(`${this.base}/users`, request);
  }

  updateUser(id: number, body: { fullName: string; email: string }): Observable<AdminUserDetail> {
    return this.http.put<AdminUserDetail>(`${this.base}/users/${id}`, body);
  }

  changeRole(id: number, roleId: number): Observable<AdminUserDetail> {
    return this.http.put<AdminUserDetail>(`${this.base}/users/${id}/role`, { roleId });
  }

  setStatus(id: number, status: AccountStatus, reason?: string): Observable<AdminUserDetail> {
    return this.http.put<AdminUserDetail>(`${this.base}/users/${id}/status`, { status, reason });
  }

  deleteUser(id: number, confirmEmail: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/users/${id}`, { body: { confirmEmail } });
  }

  resetPassword(id: number): Observable<{ temporaryPassword: string }> {
    return this.http.post<{ temporaryPassword: string }>(`${this.base}/users/${id}/reset-password`, {});
  }

  sendResetEmail(id: number): Observable<{ emailSent: boolean; message: string }> {
    return this.http.post<{ emailSent: boolean; message: string }>(
      `${this.base}/users/${id}/send-reset-email`,
      {},
    );
  }

  // ----- Roles, dashboard, activity, health -----

  roles(): Observable<RoleSummary[]> {
    return this.http.get<RoleSummary[]>(`${this.base}/roles`);
  }

  overview(): Observable<AdminOverview> {
    return this.http.get<AdminOverview>(`${this.base}/overview`);
  }

  health(): Observable<SystemHealth> {
    return this.http.get<SystemHealth>(`${this.base}/health`);
  }

  audit(query: AuditQuery = {}): Observable<PagedResponse<AuditEntry>> {
    return this.http.get<PagedResponse<AuditEntry>>(`${this.base}/audit`, {
      params: this.toParams(query),
    });
  }

  private toParams(query: object): HttpParams {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') params = params.set(key, String(value));
    }
    return params;
  }
}