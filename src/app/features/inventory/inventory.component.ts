import { Component, OnInit, effect, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';

import { InventoryService } from '../../services/inventory.service';
import { InventoryCardComponent, PharmacyStockSelection } from '../../ui/inventory-card/inventory-card.componenet';
import { MedicinePharmacyInventoryResponse } from '../../model/inventory.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    InventoryCardComponent,MatPaginator, MatSortModule
  ],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss',
})
export class InventoryComponent implements OnInit {

  private readonly inventoryService = inject(InventoryService);
  private readonly router = inject(Router);

 
  medicines = signal<MedicinePharmacyInventoryResponse[]>([]);

  loading = signal(false);
  error = signal('');

  readonly medicinesDataSource = new MatTableDataSource<MedicinePharmacyInventoryResponse>([]);

  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  readonly pagedMedicines = toSignal(this.medicinesDataSource.connect(), {
    initialValue: [] as MedicinePharmacyInventoryResponse[],
  });

  constructor() {
  this.medicinesDataSource.sortingDataAccessor = (item, property) => {
     switch (property) {
       case 'availableCount':
          return item.pharmacies?.length ?? 0;
       case 'genericName':
          return item.genericName ?? '';
       case 'category':
         return item.category ?? '';
       default:
         return '';
  }
};

    effect(() => {
      this.medicinesDataSource.data = this.medicines();
    });

    effect(() => {
      this.medicinesDataSource.paginator = this.paginator();
      this.medicinesDataSource.sort = this.sort();
       });
  }

  ngOnInit(): void {
    this.loadInventory();
  }

  loadInventory(): void {

    this.loading.set(true);
    this.error.set('');

    this.inventoryService
      .getAllMedicinesWithPharmacies()
      .subscribe({

        next: (data) => {
          this.medicines.set(data ?? []);
          this.loading.set(false);
        },

        error: (error) => {

          console.error(
            'Failed to load inventory:',
            error
          );

          this.error.set(
            error?.error?.detail ||
            error?.error?.message ||
            'Failed to load inventory.'
          );

          this.loading.set(false);
        },

      });
  }


  refresh(): void {
    this.loadInventory();
  }


  addInventory(): void {
    this.router.navigate(['/inventory/create']);
  }


   viewInventory(selection: PharmacyStockSelection): void {

    this.inventoryService
      .getByMedicine(
        selection.pharmacyId,
        selection.medicineId
      )
      .subscribe({

        next: (inventory) => {

          this.router.navigate(['/inventory',
            selection.pharmacyId,
            inventory.id
          ]);

        },

        error: (error) => {

          console.error(
            'Failed to find inventory:',
            error
          );

          this.error.set(
            error?.error?.detail ||
            error?.error?.message ||
            'Failed to open that inventory record.'
          );

        },

      });
  }
}