import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { toSignal } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { PharmacyAdminService } from '../../services/pharmacy-admin.service';
import {MedicineAveragePrice, PharmacyAdminDashboardSummary,
  PharmacyDirectoryEntry, RankedPharmacy, UncoveredMedicineName } from '../../model/pharmacy-admin.model';

@Component({
  selector: 'app-pharmacy-admin-dashboard',
  imports: [MatPaginator, MatSortModule],
  templateUrl: './pharmacy-admin-dashboard.component.html',
  styleUrl: './pharmacy-admin-dashboard.component.scss',
})
export class PharmacyAdminDashboardComponent {
  private readonly pharmacyAdminService = inject(PharmacyAdminService);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly summary = signal<PharmacyAdminDashboardSummary | null>(null);
  readonly rankedPharmacies = signal<RankedPharmacy[]>([]);
  readonly uncoveredMedicines = signal<UncoveredMedicineName[]>([]);
  readonly averagePrices = signal<MedicineAveragePrice[]>([]);
  readonly pharmacies = signal<PharmacyDirectoryEntry[]>([]);

  
  readonly verificationQueue = computed(() => this.pharmacies().filter((p) => !p.isVerified));

  readonly topPricedMedicines = computed(() =>
    [...this.averagePrices()].sort((a, b) => b.averagePrice - a.averagePrice).slice(0, 5),
  );

  readonly directoryDataSource = new MatTableDataSource<PharmacyDirectoryEntry>([]);

  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  readonly pagedPharmacies = toSignal(this.directoryDataSource.connect(), {
    initialValue: [] as PharmacyDirectoryEntry[],
  });

  constructor() { this.directoryDataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'name':
          return item.name.toLowerCase();
        case 'licenseNumber':
          return item.licenseNumber.toLowerCase();
        case 'isVerified':
          return item.isVerified ? 1 : 0;
        case 'reliablityScore':
          return item.reliablityScore;
        case 'registeredAt':
          return new Date(item.registeredAt).getTime();
        default:
          return '';
      }
    };

    effect(() => {
      this.directoryDataSource.data = this.pharmacies();
    });

    effect(() => {
      this.directoryDataSource.paginator = this.paginator();
      this.directoryDataSource.sort = this.sort();
    });

    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading.set(true);
    this.error.set('');

    forkJoin({
      verifiedPharmacyCount: this.pharmacyAdminService.getVerifiedCount(),
      topPharmacies: this.pharmacyAdminService.getTopPharmaciesByInventory(),
      uncoveredMedicines: this.pharmacyAdminService.getUncoveredMedicines(),
      averagePrices: this.pharmacyAdminService.getAveragePrices(),
      pharmacies: this.pharmacyAdminService.getAllPharmacies(),
    }).subscribe({
      next: ({ verifiedPharmacyCount, topPharmacies, uncoveredMedicines, averagePrices, pharmacies }) => {
        this.summary.set({
          verifiedPharmacyCount,
          totalPharmacyCount: pharmacies.length,
          pricedMedicineCount: averagePrices.length,
          uncoveredMedicineCount: uncoveredMedicines.length,
        });
        this.uncoveredMedicines.set(uncoveredMedicines);
        this.averagePrices.set(averagePrices);
        this.pharmacies.set(pharmacies);

        const pharmacyById = new Map(pharmacies.map((p) => [p.id, p]));
        this.rankedPharmacies.set(
          topPharmacies.map((stat) => {
        const pharmacy = pharmacyById.get(stat.medicine);
            return {
              pharmacyId: stat.medicine,
              name: pharmacy?.name ?? `Pharmacy #${stat.medicine}`,
              itemCount: stat.medicineCount,
              reliablityScore: stat.reliablityScore,
              lowestPrice: stat.lowPrice,
            };
          }),
        );

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Failed to load the pharmacy admin dashboard:', err);
        this.error.set(
          err?.error?.detail || err?.error?.message || 'Failed to load the admin dashboard.',
        );
        this.loading.set(false);
      },
    });
  }

  refresh(): void {
    this.loadDashboard();
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '-';
    }
    return new Date(date).toLocaleDateString();
  }

  formatPrice(value: number): string {
    return `${value.toFixed(2)} ETB`;
  }
}