import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  CreatePharmacyDocumentRequest,
  PharmacyDocumentResponse,
  PharmacyDocumentReviewRequest,
} from '../model/Pharmacy-document.model';


@Injectable({ providedIn: 'root' })
export class PharmacyDocumentService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  private documentsUrl(pharmacyId: number): string {
    return `${this.baseUrl}/pharmacies/${pharmacyId}/documents`;
  }

  
  getByPharmacy(pharmacyId: number): Observable<PharmacyDocumentResponse[]> {
    return this.http.get<PharmacyDocumentResponse[]>(this.documentsUrl(pharmacyId));
  }

  
  getById(pharmacyId: number, id: number): Observable<PharmacyDocumentResponse> {
    return this.http.get<PharmacyDocumentResponse>(`${this.documentsUrl(pharmacyId)}/${id}`);
  }

  
  /**
   * The stored file as a Blob. The endpoint needs the bearer token, so a plain <a href> cannot
   * reach it; going through HttpClient lets the JWT interceptor attach the token.
   */
  getFile(pharmacyId: number, id: number): Observable<Blob> {
    return this.http.get(`${this.documentsUrl(pharmacyId)}/${id}/file`, { responseType: 'blob' });
  }

  /**
   * Open a document in a new tab: links open directly, uploaded files are fetched with the token
   * and shown from a temporary object URL. The tab is opened synchronously inside the click
   * handler (before the request) so popup blockers allow it.
   */
  openFile(document: Pick<PharmacyDocumentResponse, 'id' | 'pharmacyId' | 'fileUrl'>): Observable<void> {
    if (/^https?:\/\//i.test(document.fileUrl)) {
      window.open(document.fileUrl, '_blank', 'noopener,noreferrer');
      return of(undefined);
    }

    const tab = window.open('', '_blank');
    return this.getFile(document.pharmacyId, document.id).pipe(
      map((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        if (tab) tab.location.href = objectUrl;
        else window.open(objectUrl, '_blank');
        // The tab has loaded it long before this fires; free the memory.
        setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      }),
      // Don't leave a blank tab behind when the download failed.
      tap({ error: () => tab?.close() }),
    );
  }

  create(
    pharmacyId: number,
    request: CreatePharmacyDocumentRequest
  ): Observable<PharmacyDocumentResponse> {
    return this.http.post<PharmacyDocumentResponse>(this.documentsUrl(pharmacyId), request);
  }

 
  review(
    pharmacyId: number,
    id: number,
    request: PharmacyDocumentReviewRequest
  ): Observable<PharmacyDocumentResponse> {
    return this.http.patch<PharmacyDocumentResponse>(
      `${this.documentsUrl(pharmacyId)}/${id}/review`,
      request
    );
  }
}