import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PharmacyDashboard } from '../model/pharmacy-dashboard.model';

@Injectable({ providedIn: 'root' })
export class PharmacyDashboardService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  get(pharmacyId: number): Observable<PharmacyDashboard> {
    return this.http.get<PharmacyDashboard>(`${this.baseUrl}/pharmacies/${pharmacyId}/dashboard`);
  }
}