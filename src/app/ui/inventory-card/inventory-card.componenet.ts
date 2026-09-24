import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { InventoryStatus, MedicinePharmacyInventoryResponse } from '../../model/inventory.model';


export interface PharmacyStockSelection {
  medicineId: number;
  pharmacyId: number;
}

@Component({
  selector: 'app-inventory-card',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './inventory-card.componenet.html',
  styleUrl: './inventory-card.componenet.scss',
})
export class InventoryCardComponent {
  medicine = input.required<MedicinePharmacyInventoryResponse>();

  view = output<PharmacyStockSelection>();

  onViewPharmacy(pharmacyId: number): void {
    this.view.emit({ medicineId: this.medicine().medicineId, pharmacyId });
  }

  getStatusClass(status: InventoryStatus | undefined): string {
    if (!status) {
      return 'status-default';
    }

    switch (status.toLowerCase()) {
      case 'available':
      case 'fresh':
        return 'status-available';

      case 'low':
        return 'status-low';

      case 'outofstock':
      case 'out of stock':
        return 'status-out';

      case 'expired':
        return 'status-expired';

      default:
        return 'status-default';
    }
  }
}