import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PharmacyListCardComponenet } from '../../ui/pharmacy-list-card/pharmacy-list-card.componenet';
import { PagedPharmacyQuery, PharmacyListItem } from '../../model/pharmacy.model';
import { PharmacyListService } from '../../services/pharmacy-list.service';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';

type SortField = NonNullable<PagedPharmacyQuery['orderBy']>;

@Component({
  selector: 'app-pharmacy-list',
  standalone: true,
  imports: [FormsModule, PharmacyListCardComponenet,MatPaginatorModule, MatSortModule],
  templateUrl: './pharmacy-list.component.html',
  styleUrl: './pharmacy-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PharmacyListComponent implements OnInit {
  private readonly pharmacyListService = inject(PharmacyListService);
  private readonly router = inject(Router);

  readonly searchTerm = signal('');
  readonly pharmacies = signal<PharmacyListItem[]>([]);
  readonly totalCount = signal(0);

  readonly isLoading = this.pharmacyListService.isLoading;
  readonly loadError = this.pharmacyListService.loadError;

  pageIndex = 0;
  pageSize = 20;
  sortField: SortField | '' = '';
  sortDescending = false;

  ngOnInit(): void {
    this.loadPharmacies();
  }

  onSearch(): void {
    this.pageIndex = 0;
    this.loadPharmacies();
  }

  onClear(): void {
    this.searchTerm.set('');
    this.pageIndex = 0;
    this.loadPharmacies();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPharmacies();
  }

  onSortChange(sort: Sort): void {
    this.sortField = sort.direction ? (sort.active as SortField) : '';
    this.sortDescending = sort.direction === 'desc';
    this.pageIndex = 0;
    this.loadPharmacies();
  }

  onViewDetails(pharmacy: PharmacyListItem): void {
    this.router.navigate(['/pharmacy-list', pharmacy.id]);
  }

  private loadPharmacies(): void {
    this.pharmacyListService
      .getAll({ search: this.searchTerm().trim() || undefined, page: this.pageIndex + 1, 
          pageSize: this.pageSize, orderBy: this.sortField || undefined,
        descending: this.sortField ? this.sortDescending : undefined,})
      .subscribe({
        next: (response) => this.pharmacies.set(response.items),
        error: () => undefined,
      });
  }
}