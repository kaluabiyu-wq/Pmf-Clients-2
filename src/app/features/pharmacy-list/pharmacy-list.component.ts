import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PharmacyListCardComponenet } from '../../ui/pharmacy-list-card/pharmacy-list-card.componenet';
import { PharmacyListItem } from '../../model/pharmacy.model';
import { PharmacyListService } from '../../services/pharmacy-list.service';

@Component({
  selector: 'app-pharmacy-list',
  imports: [FormsModule, PharmacyListCardComponenet],
  templateUrl: './pharmacy-list.component.html',
  styleUrl: './pharmacy-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PharmacyListComponent implements OnInit {
  private readonly pharmacyListService = inject(PharmacyListService);
  private readonly router = inject(Router);

  readonly searchTerm = signal('');
  readonly pharmacies = signal<PharmacyListItem[]>([]);

  readonly isLoading = this.pharmacyListService.isLoading;
  readonly loadError = this.pharmacyListService.loadError;

  ngOnInit(): void {
    this.loadPharmacies();
  }

  onSearch(): void {
    this.loadPharmacies();
  }

  onClear(): void {
    this.searchTerm.set('');
    this.loadPharmacies();
  }

  onViewDetails(pharmacy: PharmacyListItem): void {
    this.router.navigate(['/pharmacy-list', pharmacy.id]);
  }

  private loadPharmacies(): void {
    this.pharmacyListService
      .getAll({ search: this.searchTerm().trim() || undefined, page: 1, pageSize: 20 })
      .subscribe({
        next: (response) => this.pharmacies.set(response.items),
        error: () => undefined,
      });
  }
}