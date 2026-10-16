import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { AlertService } from '../../../services/alert.service';
import { InventoryService } from '../../../services/inventory.service';
import { problemMessage } from '../../../services/problem-message.service';
import { InventoryStatus, UpdateInventoryRequest } from '../../../model/inventory.model';

@Component({
  selector: 'app-inventory-edit',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './inventoryedit.componenet.html',
  styleUrl: './inventoryedit.componenet.scss',
})
export class InventoryEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly inventoryService = inject(InventoryService);
  private readonly alerts = inject(AlertService);

  readonly pharmacyId = Number(this.route.snapshot.paramMap.get('pharmacyId'));
  readonly inventoryId = Number(this.route.snapshot.paramMap.get('id'));

  // The values the API accepts for Status (1-20 characters). Matches the InventoryStatus type.
  readonly statuses: { value: InventoryStatus; label: string }[] = [
    { value: 'Fresh', label: 'Fresh' },
    { value: 'Available', label: 'Available' },
    { value: 'Low', label: 'Low stock' },
    { value: 'OutOfStock', label: 'Out of stock' },
    { value: 'Expired', label: 'Expired' },
  ];

  // The pharmacy's stock list already carries medicine name, form, strength, price and status,
  // so one request gives the edit page everything it shows. The row is picked out by inventoryId.
  readonly item = rxResource({
    params: () => ({ pharmacyId: this.pharmacyId, inventoryId: this.inventoryId }),
    stream: ({ params }) =>
      this.inventoryService
        .getMedicinesByPharmacy(params.pharmacyId)
        .pipe(map((rows) => rows.find((r) => r.inventoryId === params.inventoryId) ?? null)),
  });

  readonly form = this.fb.nonNullable.group({
    price: [0, [Validators.required, Validators.min(1), Validators.max(1_000_000)]],
    status: ['', [Validators.required, Validators.maxLength(20)]],
  });

  readonly saving = signal(false);

  readonly loadError = computed(() => {
    const raw: any = this.item.error();
    if (!raw) return '';
    const e = raw.cause ?? raw;
    return e?.error?.detail || e?.error?.message || 'Failed to load this inventory record.';
  });

  constructor() {
    // Fill the form once the record arrives (and again if it is reloaded).
    effect(() => {
      const current = this.item.value();
      if (current) {
        this.form.reset({ price: current.price, status: current.status });
      }
    });
  }

  save(): void {
    const current = this.item.value();
    if (!current) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { price, status } = this.form.getRawValue();

    // Send only what changed. The API keeps omitted fields as they are, and a price change
    // is the only thing that writes a price-history row.
    const payload: UpdateInventoryRequest = {};
    if (price !== current.price) payload.price = price;
    if (status !== current.status) payload.status = status;

    if (Object.keys(payload).length === 0) {
      this.alerts.info('No changes to save.');
      this.goToDetail();
      return;
    }

    this.saving.set(true);

    this.inventoryService.update(this.pharmacyId, this.inventoryId, payload).subscribe({
      next: () => {
        this.alerts.success('Inventory updated.');
        this.goToDetail();
      },
      error: (error) => {
        console.error('Failed to update inventory:', error);
        this.saving.set(false);

        if (error?.status === 403) {
          this.alerts.error("You don't have permission to edit this pharmacy's inventory.");
          return;
        }

        // Prefer the first field-level validation message, then fall back to the
        // shared ProblemDetails parsing.
        const firstValidationMessage = error?.error?.errors
          ? (Object.values(error.error.errors).flat()[0] as string | undefined)
          : undefined;

        this.alerts.error(firstValidationMessage || problemMessage(error, 'Failed to save changes.'));
      },
    });
  }

  goToDetail(): void {
    this.router.navigate(['/pharmacy/inventory', this.pharmacyId, this.inventoryId]);
  }
}