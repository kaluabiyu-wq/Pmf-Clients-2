import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PagedPharmacyAdminSummaryResponse,
  PharmacyAdminProfile,
  PharmacyAdminQuery,
  PharmacyStatusUpdateRequest,
  PharmacyUpdateRequest,
  PharmacyWriteResult,
} from '../model/pharmacy-admin-manage.model';


@Injectable({ providedIn: 'root' })
export class PharmacyAdminManageService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/admin/pharmacies`;

  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);

 
  getAll(query: PharmacyAdminQuery = {}): Observable<PagedPharmacyAdminSummaryResponse> {
    this.isLoading.set(true);
    this.loadError.set(null);

    const params: Record<string, string> = {};
    if (query.page !== undefined) params['page'] = query.page.toString();
    if (query.pageSize !== undefined) params['pageSize'] = query.pageSize.toString();
    if (query.search) params['search'] = query.search;
    if (query.orderBy) params['orderBy'] = query.orderBy;
    if (query.descending !== undefined) params['descending'] = query.descending.toString();
    if (query.isVerified !== undefined) params['isVerified'] = query.isVerified.toString();
    if (query.isActive !== undefined) params['isActive'] = query.isActive.toString();
    if (query.freshness) params['freshness'] = query.freshness;

    return this.http.get<PagedPharmacyAdminSummaryResponse>(this.baseUrl, { params }).pipe(
      tap(() => this.isLoading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.loadError.set(this.extractErrorMessage(err));
        return throwError(() => err);
      }),
    );
  }

  
  getProfile(id: number): Observable<PharmacyAdminProfile> {
    return this.http.get<PharmacyAdminProfile>(`${this.baseUrl}/${id}/profile`).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => err)),
    );
  }

  
  update(id: number, request: PharmacyUpdateRequest): Observable<PharmacyWriteResult> {
    return this.http.put<PharmacyWriteResult>(`${this.baseUrl}/${id}`, request).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => err)),
    );
  }

 
  setStatus(id: number, request: PharmacyStatusUpdateRequest): Observable<PharmacyWriteResult> {
    return this.http.patch<PharmacyWriteResult>(`${this.baseUrl}/${id}/status`, request).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => err)),
    );
  }

  
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`).pipe(
      catchError((err: HttpErrorResponse) => throwError(() => err)),
    );
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Could not reach the server. Check that the API is running and that CORS allows this origin.';
    }
    if (err.status === 404) {
      return 'This pharmacy could not be found.';
    }
    if (err.status === 400) {
      return 'The request was rejected — check the required fields (name, licence number, location, phone number, freshness threshold).';
    }
    return 'Something went wrong while loading the pharmacy admin data. Please try again.';
  }
}
