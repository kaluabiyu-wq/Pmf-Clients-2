import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PrescriptionListQuery,
  PrescriptionPage,
  PrescriptionRequest,
  PrescriptionResponse,
  PrescriptionReviewRequest,
} from '../model/prescription.model';

@Injectable({ providedIn: 'root' })
export class PrescriptionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  // ---------- Patient ----------

  /**
   * Attach a prescription to a Pending order that contains prescription-only medicine.
   * 409 if one is already awaiting review or already approved; a rejected one is replaced
   * by submitting a new one.
   */
  submit(orderId: number, request: PrescriptionRequest): Observable<PrescriptionResponse> {
    return this.http.post<PrescriptionResponse>(
      `${this.baseUrl}/orders/${orderId}/prescriptions`,
      request,
    );
  }

  /** Newest first, including rejected attempts and their notes. Patient or pharmacy staff. */
  getByOrder(orderId: number): Observable<PrescriptionResponse[]> {
    return this.http.get<PrescriptionResponse[]>(`${this.baseUrl}/orders/${orderId}/prescriptions`);
  }

  getById(id: number): Observable<PrescriptionResponse> {
    return this.http.get<PrescriptionResponse>(`${this.baseUrl}/prescriptions/${id}`);
  }

  // ---------- Pharmacy staff ----------

  /** The verification queue. With status=Pending it is listed oldest first. */
  getByPharmacy(pharmacyId: number, query: PrescriptionListQuery = {}): Observable<PrescriptionPage> {
    let params = new HttpParams();
    if (query.status) params = params.set('status', query.status);
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    return this.http.get<PrescriptionPage>(`${this.baseUrl}/pharmacies/${pharmacyId}/prescriptions`, {
      params,
    });
  }

  /** Approve or reject. A prescription is decided once; a second decision returns 409. */
  review(id: number, request: PrescriptionReviewRequest): Observable<PrescriptionResponse> {
    return this.http.patch<PrescriptionResponse>(`${this.baseUrl}/prescriptions/${id}/review`, request);
  }
}
