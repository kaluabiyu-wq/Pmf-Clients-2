import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PharmacyListItem } from '../../model/pharmacy.model';

@Component({
  selector: 'app-pharmacy-list-card',
  imports: [CommonModule],
  templateUrl: './pharmacy-list-card.componenet.html',
  styleUrl: './pharmacy-list-card.componenet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PharmacyListCardComponenet {
  readonly pharmacy = input.required<PharmacyListItem>();

  readonly viewDetails = output<PharmacyListItem>();

  readonly statusLabel = computed(() => (this.pharmacy().isActive ? 'Active' : 'Inactive'));
  readonly statusClass = computed(() => (this.pharmacy().isActive ? 'active' : 'inactive'));

  onCardClick(): void {
    this.viewDetails.emit(this.pharmacy());
  }
}