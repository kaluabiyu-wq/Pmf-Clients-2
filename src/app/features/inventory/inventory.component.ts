import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { InventoryService } from '../../services/inventory.service';
import { InventoryCardComponent, PharmacyStockSelection } from '../../ui/inventory-card/inventory-card.componenet';
import { MedicinePharmacyInventoryResponse } from '../../model/inventory.model';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [
    InventoryCardComponent,
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
    this.router.navigate([
      '/inventory/create'
    ]);
  }


   viewInventory(selection: PharmacyStockSelection): void {

    this.inventoryService
      .getByMedicine(
        selection.pharmacyId,
        selection.medicineId
      )
      .subscribe({

        next: (inventory) => {

          this.router.navigate([
            '/inventory',
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