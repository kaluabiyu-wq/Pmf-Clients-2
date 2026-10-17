import { DecimalPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { EMPTY, expand, forkJoin, map, reduce } from 'rxjs';
import { AuthService } from '../../../services/auth-service.service';
import { InventoryService } from '../../../services/inventory.service';
import { MedicineService } from '../../../services/medicine.service';
import { AlertService } from '../../../services/alert.service';
import { Medicine } from '../../../model/medicine.model';


@Component({
  selector: 'app-add-inventory',
  standalone: true,
  imports: [ReactiveFormsModule, DecimalPipe],
  templateUrl: './add-inventory.component.html',
  styleUrl: './add-inventory.component.scss',
})
export class AddInventoryComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly inventoryService = inject(InventoryService);
  private readonly medicineService = inject(MedicineService);
  private readonly router = inject(Router);
  private readonly alerts = inject(AlertService);

  private readonly listRoute = ['/pharmacy/inventory'];

  readonly pharmacyId = computed(() => this.auth.pharmacyId());

  readonly loading = signal(true);
  readonly loadError = signal<string | null>(null);
  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);

  private readonly catalogue = signal<Medicine[]>([]);
  private readonly takenIds = signal<ReadonlySet<number>>(new Set());

  readonly search = signal('');

  readonly form = this.fb.group({
    medicineId: this.fb.control<number | null>(null, Validators.required),
    price: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
  });

  private readonly selectedId = toSignal(this.form.controls.medicineId.valueChanges, {
    initialValue: this.form.controls.medicineId.value,
  });


  readonly options = computed(() => {
    const term = this.search().trim().toLowerCase();
    const taken = this.takenIds();
    return this.catalogue()
      .filter((m) => m.isActive && !taken.has(m.id))
      .filter(
        (m) =>
          !term ||
          m.genericName.toLowerCase().includes(term) ||
          (m.brandName ?? '').toLowerCase().includes(term),
      )
      .sort((a, b) => a.genericName.localeCompare(b.genericName));
  });

  readonly selected = computed(
    () => this.catalogue().find((m) => m.id === this.selectedId()) ?? null,
  );

  ngOnInit(): void {
    const pharmacyId = this.pharmacyId();
    if (pharmacyId === null || pharmacyId === undefined) {
      this.loading.set(false);
      this.loadError.set('No pharmacy is linked to your account.');
      return;
    }

    forkJoin({
      medicines: this.loadWholeCatalogue(),
      stocked: this.inventoryService.getMedicinesByPharmacy(pharmacyId),
      submissions: this.inventoryService.getSubmissionsByPharmacy(pharmacyId),
    }).subscribe({
      next: ({ medicines, stocked, submissions }) => {
        this.catalogue.set(medicines);
        this.takenIds.set(
          new Set([...stocked.map((s) => s.medicineId), ...submissions.map((s) => s.medicineId)]),
        );
        this.loading.set(false);
      },
      error: (err) => {
        console.error(err);
        this.loading.set(false);
        this.loadError.set(err?.error?.detail || 'Could not load the medicine catalogue.');
      },
    });
  }

  onSearch(event: Event): void {
    this.search.set((event.target as HTMLInputElement).value);
  }

  onSubmit(): void {
    const pharmacyId = this.pharmacyId();
    if (this.form.invalid || pharmacyId === null || pharmacyId === undefined) {
      this.form.markAllAsTouched();
      return;
    }

    const { medicineId, price } = this.form.getRawValue();
    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.inventoryService.create(pharmacyId, { medicineId: medicineId!, price: price! }).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.alerts.success(
          `${this.selected()?.genericName ?? 'Medicine'} was submitted. It will appear in your inventory once a pharmacy admin approves it.`,
        );
        this.router.navigate(this.listRoute);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const message =
          err?.status === 403
            ? 'You are not allowed to add inventory for this pharmacy.'
            : err?.error?.detail || err?.error?.title || 'Could not submit this medicine.';
        this.submitError.set(message);
        this.alerts.error(message);
        console.error(err);
      },
    });
  }

  onCancel(): void {
    this.router.navigate(this.listRoute);
  }

  private loadWholeCatalogue() {
    const pageSize = 50;
    return this.medicineService.getPage(1, pageSize).pipe(
      expand((p) =>
        p.items.length > 0 && p.page * p.pageSize < p.totalCount
          ? this.medicineService.getPage(p.page + 1, pageSize)
          : EMPTY,
      ),
      map((p) => p.items),
      reduce((all, items) => all.concat(items), [] as Medicine[]),
    );
  }
}
