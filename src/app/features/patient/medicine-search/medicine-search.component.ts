import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MedicineSearchCardComponent } from '../../../ui/medicine-search-card/medicine-search-card.componenet';
import { SearchResultItem } from '../../../model/search.model';
import { SearchService } from '../../../services/search.service';
import { AuthService } from '../../../services/auth-service.service';

@Component({
  selector: 'app-medicine-search',
  imports: [FormsModule, MedicineSearchCardComponent],
  templateUrl: './medicine-search.component.html',
  styleUrl: './medicine-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MedicineSearchComponent {
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly auth = inject(AuthService);

  // Derived from the logged-in user (JWT + /auth/me profile).
  private readonly userId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly locationId = computed(() => this.auth.currentUser()?.locationId ?? null);
  readonly locationLabel = computed(
    () => this.auth.currentUser()?.locationLabel ?? 'Select location',
  );
  readonly currentUserName = computed(() => this.auth.currentUser()?.fullName ?? '');

  readonly searchTerm = signal('');
  readonly hasSearched = signal(false);
  readonly results = signal<SearchResultItem[]>([]);

  readonly isSearching = this.searchService.isSearching;
  readonly searchError = this.searchService.searchError;

  constructor() {
    const initialTerm = this.route.snapshot.queryParamMap.get('q');
    if (initialTerm) {
      this.searchTerm.set(initialTerm);
      this.onSearch();
    }
  }

  onSearch(): void {
    const term = this.searchTerm().trim();
    const userId = this.userId();
    const locationId = this.locationId();

    if (!term || userId === null || locationId === null) {
      return;
    }

    this.searchService
      .search(userId, {
        medicineSearch: term,
        locationId,
      })
      .subscribe({
        next: (response) => {
          this.results.set(response.results);
          this.hasSearched.set(true);
        },
        error: () => undefined,
      });
  }

  onClear(): void {
    this.searchTerm.set('');
  }

  onDirections(item: SearchResultItem): void {
    console.log('Directions requested for pharmacy', item.pharmacyId);
  }

  onNotifyMe(item: SearchResultItem): void {
    console.log('Notify-me requested for pharmacy', item.pharmacyId, 'medicine', item.medicineId);
  }

  onViewDetails(item: SearchResultItem): void {
    this.searchService.selectResult(item);
    this.router.navigate(['../patient/search', item.pharmacyId, item.medicineId]);
  }
}