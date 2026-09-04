import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Location as PmfLocation, PagedResponse } from '../model/location.model';
import { PagedPharmacyQuery, Pharmacy, PharmacyListItem } from '../model/pharmacy.model';
import { LocationService } from './location.service';

import { PharmacyMedicine } from '../model/pharmacy.model';
import { PharmacyMedicineDetail } from '../model/inventory.model';



@Injectable({ providedIn: 'root' })
export class PharmacyListService {
  private readonly http = inject(HttpClient);
  private readonly locationService = inject(LocationService);
  private readonly baseUrl = `${environment.apiBaseUrl}/pharmacies`;

  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);

  getAll(query: PagedPharmacyQuery = {}): Observable<PagedResponse<PharmacyListItem>> {
    this.isLoading.set(true);
    this.loadError.set(null);

    const params: Record<string, string> = {};
    if (query.page !== undefined) params['page'] = query.page.toString();
    if (query.pageSize !== undefined) params['pageSize'] = query.pageSize.toString();
    if (query.search) params['search'] = query.search;
    if (query.orderBy) params['orderBy'] = query.orderBy;
    if (query.descending !== undefined) params['descending'] = query.descending.toString();

    return this.http.get<PagedResponse<Pharmacy>>(this.baseUrl, { params }).pipe(
      switchMap((response) => this.joinLocations(response)),
      tap(() => this.isLoading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.loadError.set(this.extractErrorMessage(err));
        return throwError(() => err);
      }),
    );
  }

  getById(id: number): Observable<PharmacyListItem> {
    return this.http.get<Pharmacy>(`${this.baseUrl}/${id}`).pipe(
      switchMap((pharmacy) =>
        this.locationService.getAll({ pageSize: 200 }).pipe(
          map((locResponse) => {
            const location = locResponse.items.find((l) => l.id === pharmacy.locationId) ?? null;
            return { ...pharmacy, location };
          }),
        ),
      ),
    );
  }

 
getMedicineDetailByIds(pharmacyId: number,
   medicineId: number ): Observable<PharmacyMedicineDetail> {
  return this.http.get<PharmacyMedicineDetail[]>(
    `${this.baseUrl}/${pharmacyId}/inventory/medicines`
  ).pipe(
    map(medicines => {
      const found = medicines.find(m => m.medicineId === medicineId);
      if (!found) throw new Error(`Medicine ${medicineId} not found at pharmacy ${pharmacyId}`);
      return found;
    })
  );
}
 
  getMedicinesByPharmacy(id: number): Observable<PharmacyMedicine[]> {
    return this.http.get<PharmacyMedicine[]>(
      `${this.baseUrl}/${id}/inventory/medicines`,
    );
  }



  private joinLocations(
    response: PagedResponse<Pharmacy>,
  ): Observable<PagedResponse<PharmacyListItem>> {
    if (response.items.length === 0) {
      return of({ ...response, items: [] });
    }

    return this.locationService.getAll({ pageSize: 200 }).pipe(
      map((locResponse) => {
        const byId = new Map<number, PmfLocation>(locResponse.items.map((l) => [l.id, l]));
        const items: PharmacyListItem[] = response.items.map((p) => ({
          ...p,
          location: byId.get(p.locationId) ?? null,
        }));
        return { ...response, items };
      }),
    );
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Could not reach the server. Check that the API is running and that CORS allows this origin.';
    }
    if (err.status === 404) {
      return 'Pharmacy endpoint not found. Check the API base URL configuration.';
    }
    return 'Something went wrong while loading pharmacies. Please try again.';
  }
}