import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
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