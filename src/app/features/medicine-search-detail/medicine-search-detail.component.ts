import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, map, switchMap } from 'rxjs';
import { SearchService } from '../../services/search.service';
import { PharmacyListService } from '../../services/pharmacy-list.service';
import { SearchResultItem } from '../../model/search.model';
import { PharmacyMedicineDetail } from '../../model/inventory.model';

@Component({
  selector: 'app-medicine-search-detail',
  imports: [CurrencyPipe, DatePipe,RouterLink],
  styleUrl: './medicine-search-detail.component.scss',
  templateUrl: './medicine-search-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicineSearchDetailComponent {
  private readonly searchService = inject(SearchService);
  private readonly pharmacyService  = inject(PharmacyListService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

     readonly pharmacyId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('pharmacyId')))),
  );
   readonly medicineId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('medicineId')))),
  );

   readonly category    = computed(() => (this.result() as any)?.category    ?? null);
   readonly dosageForm  = computed(() => (this.result() as any)?.dosageForm  ?? null);
  readonly strength    = computed(() => (this.result() as any)?.strength    ?? null);

  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);
  
 
readonly result = computed<SearchResultItem | PharmacyMedicineDetail | null>(() => {
  const pId = this.pharmacyId();
  const mId = this.medicineId();
  const full = this.fullDetail();    
  const selected = this.searchService.selectedResult();

   if (selected && selected.pharmacyId === pId && selected.medicineId === mId) {
    return full ? { ...selected, ...full } : selected;
  }

  if (full) {
    this.isLoading.set(false);
    return full;
  }

  const detail = this.apiDetail();
  if (detail) {
    this.isLoading.set(false);
    return detail;
  }

  return null;
});

private readonly fullDetail = toSignal(
  this.route.paramMap.pipe(
    map((p) => ({
      pharmacyId: Number(p.get('pharmacyId')),
      medicineId: Number(p.get('medicineId')),
    })),
    switchMap(({ pharmacyId, medicineId }) => {
      if (!pharmacyId || !medicineId) return EMPTY;
      return this.pharmacyService
        .getMedicineDetailByIds(pharmacyId, medicineId)
        .pipe(catchError(() => EMPTY));
    }),
  ),
);

  private readonly apiDetail = toSignal(
    this.route.paramMap.pipe(
      map((p) => ({
        pharmacyId: Number(p.get('pharmacyId')),
        medicineId: Number(p.get('medicineId')),
      })),
      switchMap(({ pharmacyId, medicineId }) => {
       
        const selected = this.searchService.selectedResult();
        if (
          selected &&
          selected.pharmacyId === pharmacyId &&
          selected.medicineId === medicineId
        ) {
          return EMPTY;
        }

        if (!pharmacyId || !medicineId) return EMPTY;

        this.isLoading.set(true);
        this.loadError.set(null);

        return this.pharmacyService
          .getMedicineDetailByIds(pharmacyId, medicineId)
          .pipe(
            catchError((err) => {
              this.isLoading.set(false);
              this.loadError.set(
                'Could not load medicine details. Please try again.',
              );
              return EMPTY;
            }),
             );
      }),
    ),
  );

  readonly isMissingData = computed(() => !this.result() && !!this.pharmacyId() && !!this.medicineId());

  readonly statusLabel = computed<string>(() => {
    const status = this.result()?.status;
    if (status === 'Fresh' || status === 'Available') return 'In stock';
    if (status === 'Stale' || status === 'Low' ) return 'Low stock';
    if (status === 'Expired' || status === 'OutOfStock') return 'Out of stock';
    return status ?? '';
  });

  readonly statusClass = computed<string>(() => {
    switch (this.statusLabel()) {
      case 'In stock':
        return 'badge-in-stock';
      case 'Low stock':
        return 'badge-low-stock';
      case 'Out of stock':
        return 'badge-out-of-stock';
      default:
        return 'badge-default';
    }
  });

  private getStatus(): string {
    const r = this.result();
    if (!r) return '';
    return (r as any).status ?? (r as any).freshnessStatus ?? '';
  }


  readonly isOutOfStock = computed(() => this.statusLabel() === 'Out of stock');

  readonly pharmacyName = computed(() => {
    const r = this.result();
    if (!r) return '';
    return (r as SearchResultItem).pharmacyName
      ?? (r as PharmacyMedicineDetail).pharmacyName
      ?? `Pharmacy #${this.pharmacyId()}`;
  });

  readonly locationLabel = computed(() => {
    const r = this.result() as any;
    if (!r) return '';
    return r.locationLabel ?? r.location?.label ?? '';
  });

  readonly distanceKm = computed(() => {
    const r = this.result() as any;
    return r?.distanceKm ?? null;
  });

  readonly genericName = computed(() => {
    const r = this.result() as any;
    return r?.genericName ?? r?.medicineName ?? '';
  });

  readonly brandName = computed(() => {
    const r = this.result() as any;
    return r?.brandName ?? null;
  });

  readonly price = computed(() => {
    const r = this.result() as any;
    return r?.price ?? null;
  });

  readonly lastUpdatedAt = computed(() => {
    const r = this.result() as any;
    return r?.lastUpdatedAt ?? r?.lastUpdated ?? null;
  });
  
  onBack(): void {
    this.router.navigate(['/medicine-search']);
  }

  onDirections(): void {
    if (!this.result()) return;
  const pId = (this.result() as any)?.pharmacyId ?? this.pharmacyId();
  console.log('Directions requested for pharmacy', pId);
  }

  onNotifyMe(): void {
    if (!this.result()) return;
  const pId = (this.result() as any)?.pharmacyId ?? this.pharmacyId();
  const mId = (this.result() as any)?.medicineId ?? this.medicineId();
  console.log('Notify-me requested for pharmacy', pId, 'medicine', mId);
  }
}