import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { PharmacyAdminCardComponenet } from '../../ui/pharmacy-admin-card/pharmacy-admin-card.componenet';
import { PharmacyAdminManageService } from '../../services/pharmacy-admin-manage.service';
import { PharmacyAdminQuery, PharmacyAdminSummary } from '../../model/pharmacy-admin-manage.model';

type SortField = NonNullable<PharmacyAdminQuery['orderBy']>;
type VerifiedFilter = 'all' | 'verified' | 'unverified';
type ActiveFilter = 'all' | 'active' | 'suspended';
type FreshnessFilter = 'all' | 'Fresh' | 'Stale';


@Component({
  selector: 'app-pharmacy-admin-manages',
  imports: [FormsModule, PharmacyAdminCardComponenet, MatPaginatorModule, MatSortModule],
  templateUrl: './pharmacy-admin-manages.component.html',
  styleUrl: './pharmacy-admin-manages.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PharmacyAdminManagesComponent implements OnInit {
  private readonly pharmacyAdminManageService = inject(PharmacyAdminManageService);
  private readonly router = inject(Router);

  readonly searchTerm = signal('');
  readonly pharmacies = signal<PharmacyAdminSummary[]>([]);
  readonly totalCount = signal(0);

  readonly isLoading = this.pharmacyAdminManageService.isLoading;
  readonly loadError = this.pharmacyAdminManageService.loadError;

  pageIndex = 0;
  pageSize = 20;
  sortField: SortField | '' = '';
  sortDescending = false;

  verifiedFilter: VerifiedFilter = 'all';
  activeFilter: ActiveFilter = 'all';
  freshnessFilter: FreshnessFilter = 'all';

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

  onFilterChange(): void {
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

  onManage(pharmacy: PharmacyAdminSummary): void {
    this.router.navigate(['/pharmacy-admin-manages', pharmacy.id]);
  }

  private loadPharmacies(): void {
    this.pharmacyAdminManageService
      .getAll({
        search: this.searchTerm().trim() || undefined,
        page: this.pageIndex + 1,
        pageSize: this.pageSize,
        orderBy: this.sortField || undefined,
        descending: this.sortField ? this.sortDescending : undefined,
        isVerified: this.verifiedFilter === 'all' ? undefined : this.verifiedFilter === 'verified',
        isActive: this.activeFilter === 'all' ? undefined : this.activeFilter === 'active',
        freshness: this.freshnessFilter === 'all' ? undefined : this.freshnessFilter,
      })
      .subscribe({
        next: (response) => {
          this.pharmacies.set(response.items);
          this.totalCount.set(response.totalCount);
        },
        error: () => undefined,
      });
  }
}
