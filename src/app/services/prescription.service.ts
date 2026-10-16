import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  isPrescriptionLink,
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

  /**
   * Upload the prescription photo/PDF itself (multipart/form-data, field name "File").
   * Same order rules and 409s as {@link submit}. Do not set Content-Type: the browser must add
   * the multipart boundary.
   */
  upload(orderId: number, file: File): Observable<PrescriptionResponse> {
    const body = new FormData();
    body.append('File', file, file.name);
    return this.http.post<PrescriptionResponse>(
      `${this.baseUrl}/orders/${orderId}/prescriptions/upload`,
      body,
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

  // ---------- Reading the file back ----------

  /**
   * The stored file as a Blob. The endpoint needs the bearer token, so a plain <a href> cannot
   * reach it; going through HttpClient lets the JWT interceptor attach the token.
   * 404 for old link submissions (nothing is stored) and for anyone who may not see it.
   */
  getFile(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/prescriptions/${id}/file`, { responseType: 'blob' });
  }

  /**
   * Open a prescription in a new tab: link submissions open directly, uploads are fetched with
   * the token and shown from a temporary object URL. The tab is opened synchronously inside the
   * click handler (before the request) so popup blockers allow it.
   */
  openFile(prescription: Pick<PrescriptionResponse, 'id' | 'fileUrl'>): Observable<void> {
    if (isPrescriptionLink(prescription.fileUrl)) {
      return new Observable<void>((subscriber) => {
        window.open(prescription.fileUrl, '_blank', 'noopener,noreferrer');
        subscriber.next();
        subscriber.complete();
      });
    }

    const tab = window.open('', '_blank');
    return this.getFile(prescription.id).pipe(
      map((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        if (tab) tab.location.href = objectUrl;
        else window.open(objectUrl, '_blank');
        // The tab has loaded it long before this fires; free the memory.
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      }),
      // Don't leave a blank tab behind when the download failed.
      (source) =>
        new Observable<void>((subscriber) =>
          source.subscribe({
            next: (v) => subscriber.next(v),
            error: (e) => {
              tab?.close();
              subscriber.error(e);
            },
            complete: () => subscriber.complete(),
          }),
        ),
    );
  }
}
