import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { PharmacyAdminSummary } from '../../model/pharmacy-admin-manage.model';

@Component({
  selector: 'app-pharmacy-admin-card',
  imports: [CommonModule],
  templateUrl: './pharmacy-admin-card.componenet.html',
  styleUrl: './pharmacy-admin-card.componenet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PharmacyAdminCardComponenet {
  readonly pharmacy = input.required<PharmacyAdminSummary>();

  readonly viewDetails = output<PharmacyAdminSummary>();


  readonly activeLabel = computed(() => (this.pharmacy().isActive ? 'Active' : 'Suspended'));
  readonly activeClass = computed(() => (this.pharmacy().isActive ? 'active' : 'suspended'));

  readonly verifiedLabel = computed(() => (this.pharmacy().isVerified ? 'Verified' : 'Unverified'));
  readonly verifiedClass = computed(() => (this.pharmacy().isVerified ? 'verified' : 'unverified'));

  
  readonly freshnessClass = computed(() => this.pharmacy().freshnessStatus.toLowerCase());

  onCardClick(): void {
    this.viewDetails.emit(this.pharmacy());
  }
}
