import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router,ActivatedRoute } from '@angular/router';
import { MedicineSearchCardComponent } from '../../ui/medicine-search-card/medicine-search-card.componenet';
import { SearchResultItem } from '../../model/search.model';
import { SearchService } from '../../services/search.service';

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

  // Signed-in for Yonas Tesfaye (Patient), seeded as the 4th user -> id 4. 
  private readonly userId = signal(4);

  // Yonas Tesfaye seeded location: Locations[3] "Arada Branch Area" -> the 4th location seeded -> id 4.
  readonly locationId = signal(4);
  readonly locationLabel = signal('Arada, Addis Ababa');
  readonly currentUserName = signal('Yonas Tesfaye');

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
    if (!term) {
      return;
    }

    this.searchService
      .search(this.userId(), {
        medicineSearch: term,
        locationId: this.locationId(),
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
    this.router.navigate(['/search', item.pharmacyId, item.medicineId]);
  }
}