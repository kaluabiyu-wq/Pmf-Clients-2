import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PharmacyStaffRequest, PharmacyStaffResponse } from '../model/pharmacy-staff.model';

@Injectable({ providedIn: 'root' })
export class PharmacyStaffService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private staffUrl(pharmacyId: number): string {
    return `${this.baseUrl}/pharmacies/${pharmacyId}/staff`;
  }

  getByPharmacy(pharmacyId: number): Observable<PharmacyStaffResponse[]> {
    return this.http.get<PharmacyStaffResponse[]>(this.staffUrl(pharmacyId));
  }

  getById(pharmacyId: number, id: number): Observable<PharmacyStaffResponse> {
    return this.http.get<PharmacyStaffResponse>(`${this.staffUrl(pharmacyId)}/${id}`);
  }

  create(pharmacyId: number, request: PharmacyStaffRequest): Observable<PharmacyStaffResponse> {
    return this.http.post<PharmacyStaffResponse>(this.staffUrl(pharmacyId), request);
  }

  deactivate(pharmacyId: number, id: number): Observable<PharmacyStaffResponse> {
    return this.http.patch<PharmacyStaffResponse>(`${this.staffUrl(pharmacyId)}/${id}/deactivate`, {});
  }
}