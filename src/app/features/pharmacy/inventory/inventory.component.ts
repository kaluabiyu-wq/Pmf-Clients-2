import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input, viewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth-service.service';
import { InventoryService } from '../../../services/inventory.service';
import { InventorySubmission, PharmacyMedicineDetail } from '../../../model/inventory.model';
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
  private readonly route = inject(ActivatedRoute)
 

  // Set by the PharmacyAdmin pharmacy picker; null for a pharmacy owner, who is scoped to their own pharmacy.
  readonly pharmacyId = input<number | null>(null);
  readonly activePharmacyId = computed(() => this.pharmacyId() ?? this.auth.pharmacyId());

  // Loads one pharmacy's stock. Stays idle while no pharmacy is known,
  // and re-fetches automatically if the chosen or signed-in pharmacy changes.
  readonly stock = rxResource({
    params: () => this.activePharmacyId() ?? undefined,
    stream: ({ params: pharmacyId }) => this.inventoryService.getMedicinesByPharmacy(pharmacyId),
  });

  // Items this pharmacy submitted that are still waiting for approval, or were rejected.
  // They are not part of `stock` (only approved items are), so they get their own list.
  readonly submissions = rxResource({
    params: () => this.activePharmacyId() ?? undefined,
    stream: ({ params: pharmacyId }) => this.inventoryService.getSubmissionsByPharmacy(pharmacyId),
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
    this.submissions.reload();
  }

  addInventory(): void {
    this.router.navigate(['../add-inventory'], { relativeTo: this.route});
  }

  /** Lets the pharmacy clear a rejected submission so it can submit that medicine again. */
  removeSubmission(row: InventorySubmission): void {
    if (!confirm(`Remove the rejected submission for ${row.genericName}? You can submit it again afterwards.`)) {
      return;
    }

    this.inventoryService.delete(row.pharmacyId, row.id).subscribe({
      next: () => {
        this.alerts.success(`${row.genericName} was removed. You can submit it again.`);
        this.submissions.reload();
      },
      error: (err) => {
        this.alerts.error(err?.error?.detail || 'Could not remove this submission.');
        console.error(err);
      },
    });
  }

  submissionClass(status: string): string {
    return status === 'Rejected' ? 'status-rejected' : 'status-pending';
  }

  // The row already carries its inventoryId, so no extra lookup request is needed.
  viewInventory(row: PharmacyMedicineDetail): void {
    const pharmacyId = this.activePharmacyId();
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