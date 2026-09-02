import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { InventoryService } from '../../services/inventory.service';
import { InventoryRecord, InventoryStatus } from '../../model/inventory.model';

@Component({
  selector: 'app-inventory-detail',
  standalone: true,
  imports: [DecimalPipe,RouterLink],
  templateUrl: './inventory-detail.component.html',
  styleUrl: './inventory-detail.component.scss',
})
export class InventoryDetailComponent implements OnInit {
  private readonly inventoryService = inject(InventoryService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  inventory = signal<InventoryRecord | null>(null);

  loading = signal(false);
  error = signal('');

  pharmacyId!: number;
  inventoryId!: number;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const pharmacyId = Number(params.get('pharmacyId'));
      const inventoryId = Number(params.get('id'));

      if (!pharmacyId || !inventoryId) {
        this.error.set('Invalid pharmacy or inventory ID.');
        return;
      }

      this.pharmacyId = pharmacyId;
      this.inventoryId = inventoryId;

      this.loadInventory();
    });
  }

  loadInventory(): void {
    this.loading.set(true);
    this.error.set('');

    this.inventoryService
      .getById(this.pharmacyId, this.inventoryId)
      .subscribe({
        next: (data) => {
          this.inventory.set(data);
          this.loading.set(false);
        },
        error: (error) => {
          console.error('Failed to load inventory:', error);

          this.error.set(
            error?.error?.detail ||
            error?.error?.message ||
            'Failed to load inventory details.'
          );

          this.loading.set(false);
        },
      });
  }

  getStatusClass(status: InventoryStatus | undefined): string {
    if (!status) {
      return 'status-default';
    }

    switch (status.toLowerCase()) {
      case 'fresh':
        return 'status-fresh';

      case 'available':
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

  formatDate(date: string | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString();
  }

  goBack(): void {
    this.router.navigate(['/inventory']);
  }

 
}
