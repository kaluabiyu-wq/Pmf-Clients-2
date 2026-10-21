import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CreateUserRequest, PagedResponse, PagedUserQuery, RegisterPatientRequest, User } from '../model/user.model';

@Service()
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/user`;

  /** Public sign-up. Always creates a Patient; the role is decided by the API, not sent. */
  registerPatient(request: RegisterPatientRequest): Observable<void> {
    return this.http.post<void>(`${environment.apiBaseUrl}/auth/register-patient`, request);
  }

  create(request: CreateUserRequest): Observable<User> {
    return this.http.post<User>(this.baseUrl, request);
  }

 
  getByEmail(email: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${encodeURIComponent(email)}`);
  }

   getAll(query: PagedUserQuery = {}): Observable<PagedResponse<User>> {
    const params: Record<string, string> = {};
    if (query.page !== undefined) params['page'] = query.page.toString();
    if (query.pageSize !== undefined) params['pageSize'] = query.pageSize.toString();
    if (query.search) params['search'] = query.search;
    if (query.orderBy) params['orderBy'] = query.orderBy;
    if (query.descending !== undefined) params['descending'] = query.descending.toString();

    return this.http.get<PagedResponse<User>>(this.baseUrl, { params });
  }
}