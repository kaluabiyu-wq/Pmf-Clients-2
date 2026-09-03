import { CurrencyPipe, DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { SearchService } from '../../services/search.service';

@Component({
  selector: 'app-medicine-search-detail',
  imports: [CurrencyPipe, DatePipe],
  styleUrl: './medicine-search-detail.component.scss',
  templateUrl: './medicine-search-detail.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicineSearchDetailComponent {
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  private readonly pharmacyId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('pharmacyId')))),
  );
  private readonly medicineId = toSignal(
    this.route.paramMap.pipe(map((params) => Number(params.get('medicineId')))),
  );

  
  readonly result = computed(() => {
    const selected = this.searchService.selectedResult();
    if (!selected) return null;
    if (selected.pharmacyId !== this.pharmacyId() || selected.medicineId !== this.medicineId()) {
      return null;
    }
    return selected;
  });

  readonly isMissingData = computed(() => !this.result() && !!this.pharmacyId() && !!this.medicineId());

  readonly statusLabel = computed<string>(() => {
    const status = this.result()?.status;
    if (status === 'Fresh') return 'In stock';
    if (status === 'Stale') return 'Low stock';
    if (status === 'Expired') return 'Out of stock';
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

  readonly isOutOfStock = computed(() => this.statusLabel() === 'Out of stock');

  onBack(): void {
    this.router.navigate(['/medicine-search']);
  }

  onDirections(): void {
    const item = this.result();
    if (!item) return;
    console.log('Directions requested for pharmacy', item.pharmacyId);
  }

  onNotifyMe(): void {
    const item = this.result();
    if (!item) return;
    console.log('Notify-me requested for pharmacy', item.pharmacyId, 'medicine', item.medicineId);
  }
}