import { CurrencyPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { SearchResultItem } from '../../model/search.model';


@Component({
  selector: 'app-medicine-search-card',
  imports: [CurrencyPipe],
  templateUrl: './medicine-search-card.componenet.html',
  styleUrl: './medicine-search-card.componenet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicineSearchCardComponent {
  readonly result = input.required<SearchResultItem>();

  readonly directions = output<SearchResultItem>();
  readonly notifyMe = output<SearchResultItem>();
  readonly viewDetails = output<SearchResultItem>();


  readonly statusLabel = computed<string>(() => {
    const status = this.result().status;
    if (status === 'Fresh') return 'In stock';
    if (status === 'Stale') return 'Low stock';
    if (status === 'Expired') return 'Out of stock';
    return status;
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

  onDirectionsClick(event: Event): void {
    event.stopPropagation();
    this.directions.emit(this.result());
  }

  

  onViewDetailsClick(): void {
    this.viewDetails.emit(this.result());
  }
}