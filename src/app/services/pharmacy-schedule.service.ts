import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { PharmacyScheduleDay, PharmacyScheduleRequest } from '../model/pharmacy-schedule.model';

@Injectable({ providedIn: 'root' })
export class PharmacyScheduleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private scheduleUrl(pharmacyId: number): string {
    return `${this.baseUrl}/pharmacies/${pharmacyId}/schedule`;
  }

  getWeek(pharmacyId: number): Observable<PharmacyScheduleDay[]> {
    return this.http.get<PharmacyScheduleDay[]>(this.scheduleUrl(pharmacyId));
  }

  saveWeek(pharmacyId: number, days: PharmacyScheduleRequest[]): Observable<PharmacyScheduleDay[]> {
    return this.http.put<PharmacyScheduleDay[]>(this.scheduleUrl(pharmacyId), days);
  }
}