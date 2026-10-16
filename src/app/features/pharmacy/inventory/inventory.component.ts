import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, viewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service.service';
import { InventoryService } from '../../../services/inventory.service';
import { PharmacyMedicineDetail } from '../../../model/inventory.model';
import { AlertService } from '../../../services/alert.service';
import { problemMessage } from '../../../services/problem-message.service';


@Component({
  selector: 'app-inventory',
  imports: [DecimalPipe, DatePipe, MatPaginator, MatSortModule],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
})
export class InventoryComponent {
  private readonly auth = inject(AuthService);
  private readonly inventoryService = inject(InventoryService);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);
 

  // Loads only the signed-in pharmacy's stock. Stays idle while pharmacyId is null,
  // and re-fetches automatically if a different pharmacy logs in.
  readonly stock = rxResource({
    params: () => this.auth.pharmacyId() ?? undefined,
    stream: ({ params: pharmacyId }) => this.inventoryService.getMedicinesByPharmacy(pharmacyId),
  });

  readonly errorMessage = computed(() => {
    const raw: any = this.stock.error();
    if (!raw) return '';
    const e = raw.cause ?? raw; // rxResource wraps non-Error throwables such as HttpErrorResponse
    return e?.error?.detail || e?.error?.message || 'Failed to load inventory.';
  });

  readonly medicinesDataSource = new MatTableDataSource<PharmacyMedicineDetail>([]);

  // Not .required(): the paginator and sort live inside an @if block and do not exist
  // until the data has loaded, so the first read must be allowed to return undefined.
  readonly paginator = viewChild(MatPaginator);
  readonly sort = viewChild(MatSort);

  readonly pagedMedicines = toSignal(this.medicinesDataSource.connect(), {
    initialValue: [] as PharmacyMedicineDetail[],
  });

  constructor() {
    this.medicinesDataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'genericName':
          return item.genericName ?? '';
        case 'category':
          return item.category ?? '';
        case 'price':
          return item.price ?? 0;
        case 'status':
          return item.status ?? '';
        case 'lastUpdatedAt':
          return new Date(item.lastUpdatedAt).getTime();
        default:
          return '';
      }
    };

    effect(() => {
      this.medicinesDataSource.data = this.stock.value() ?? [];
    });

    effect(() => {
      this.medicinesDataSource.paginator = this.paginator() ?? null;
      this.medicinesDataSource.sort = this.sort() ?? null;
    });
  }

  refresh(): void {
    this.stock.reload();
  }

  addInventory(): void {
    this.router.navigate(['/inventory/create']);
  }

  // The row already carries its inventoryId, so no extra lookup request is needed.
  viewInventory(row: PharmacyMedicineDetail): void {
    const pharmacyId = this.auth.pharmacyId();
    if (pharmacyId === null) return;
    this.router.navigate(['/pharmacy/inventory', pharmacyId, row.inventoryId]);
  }

  statusClass(status: string): string {
    switch ((status ?? '').toLowerCase()) {
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