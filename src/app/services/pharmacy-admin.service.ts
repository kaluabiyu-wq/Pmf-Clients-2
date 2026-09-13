import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { EMPTY, Observable, expand, forkJoin, map, reduce } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MedicineAveragePrice, PagedPharmacyDirectoryResponse,
  PharmacyAdminDashboardSummary, PharmacyCatalogueSize,
  PharmacyDirectoryEntry, TopPharmacyByInventory,
  UncoveredMedicineName, VerifiedPharmacyCount,
  } from '../model/pharmacy-admin.model';


const MAX_PAGE_SIZE = 50;
@Service()
export class PharmacyAdminService {
  private readonly http = inject(HttpClient);
  private readonly reportUrl = `${environment.apiBaseUrl}/report`;
  private readonly pharmaciesUrl = `${environment.apiBaseUrl}/pharmacies`;

  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);

   getVerifiedCount(): Observable<VerifiedPharmacyCount> {
    return this.http.get<VerifiedPharmacyCount>(`${this.reportUrl}/verified`);
  }

  
  getCatalogueSizes(): Observable<PharmacyCatalogueSize[]> {
    return this.http.get<PharmacyCatalogueSize[]>(`${this.reportUrl}/distinctmedicine`);
  }

   getAveragePrices(): Observable<MedicineAveragePrice[]> {
    return this.http.get<MedicineAveragePrice[]>(`${this.reportUrl}/averageprice`);
  }

   getUncoveredMedicines(): Observable<UncoveredMedicineName[]> {
    return this.http.get<UncoveredMedicineName[]>(`${this.reportUrl}/medicinelist`);
  }

  
  getTopPharmaciesByInventory(): Observable<TopPharmacyByInventory[]> {
    return this.http.get<TopPharmacyByInventory[]>(`${this.reportUrl}/Paginate/inventories`);
  }

  
  getPharmacyPage(page: number, pageSize = MAX_PAGE_SIZE): Observable<PagedPharmacyDirectoryResponse> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('pageSize', pageSize.toString());

    return this.http.get<PagedPharmacyDirectoryResponse>(this.pharmaciesUrl, { params });
  }

 
  getAllPharmacies(): Observable<PharmacyDirectoryEntry[]> {
    return this.getPharmacyPage(1).pipe(
        expand((response) => (response.hasNext ? this.getPharmacyPage(response.page + 1) : EMPTY)),
      reduce<PagedPharmacyDirectoryResponse, PharmacyDirectoryEntry[]>(
        (all, response) => [...all, ...response.items],
        [],
      ),
    );
  }

  
  getDashboardSummary(): Observable<PharmacyAdminDashboardSummary> {
    this.isLoading.set(true);
    this.loadError.set(null);

    return forkJoin({
      verifiedPharmacyCount: this.getVerifiedCount(),
      pharmacies: this.getAllPharmacies(),
      averagePrices: this.getAveragePrices(),
      uncoveredMedicines: this.getUncoveredMedicines(),
    }).pipe(
      map(({ verifiedPharmacyCount, pharmacies, averagePrices, uncoveredMedicines }) => ({
        verifiedPharmacyCount,
        totalPharmacyCount: pharmacies.length,
        pricedMedicineCount: averagePrices.length,
        uncoveredMedicineCount: uncoveredMedicines.length,
      })),
      tap(() => this.isLoading.set(false)),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.loadError.set(this.extractErrorMessage(err));
        throw err;
      }),
    );
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Could not reach the server. Check that the API is running.';
    }
    if (err.status === 404) {
      return 'A reporting endpoint was not found. Check the API base URL configuration.';
    }
    return 'Something went wrong while loading the admin dashboard. Please try again.';
  }
}