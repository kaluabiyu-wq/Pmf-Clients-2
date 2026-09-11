import { ChangeDetectionStrategy, Component, effect, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { PharmacyListService } from '../../services/pharmacy-list.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PharmacyMedicine } from '../../model/pharmacy.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FavoriteService } from '../../services/favorite.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-pharmacy-list-detail',
  imports: [DatePipe,DecimalPipe,MatPaginator, MatSortModule, RouterLink,FormsModule],
  templateUrl: './pharmacy-list-detail.component.html',
  styleUrl: './pharmacy-list-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PharmacyListDetailComponent {
  private readonly pharmacyListService = inject(PharmacyListService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  readonly medicines = signal<PharmacyMedicine[]>([]); 
  readonly medicinesLoading = signal(false);
  readonly medicinesError = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  favoriteUserId: number | null = null;
  addingFavorite = signal(false);
  favoriteMessage = signal('');
  favoriteError = signal(false);

  readonly medicinesDataSource = new MatTableDataSource<PharmacyMedicine>([]);

  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  readonly pagedMedicines = toSignal(this.medicinesDataSource.connect(), {
    initialValue: [] as PharmacyMedicine[],
  });

  constructor() {
   
    effect(() => {
      this.medicinesDataSource.data = this.medicines();
    });

   
    effect(() => {
      this.medicinesDataSource.paginator = this.paginator();
      this.medicinesDataSource.sort = this.sort();
    });
  }

  private loadMedicines(pharmacyId: number): void { 
    this.medicinesLoading.set(true);
    this.medicinesError.set(null); 
    this.pharmacyListService.getMedicinesByPharmacy(pharmacyId)
    .pipe(
       catchError(() => { this.medicinesError
        .set( 'Could not load the medicines available at this pharmacy.', );
         return of([]); }), ).subscribe({ next: (medicines) => 
          { this.medicines.set(medicines);
             this.medicinesLoading.set(false); 
            }, 
            error: () => {
               this.medicinesLoading.set(false);
               },
               })
               ; }

  

  readonly pharmacy = toSignal(
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) =>
        this.pharmacyListService.getById(id).pipe(
          tap((pharmacy) => {
            this.isLoading.set(false);
            this.loadError.set(null);
            this.loadMedicines(pharmacy.id);
          }),
          catchError(() => {
            this.isLoading.set(false);
            this.loadError.set('This pharmacy could not be found.');
            return of(null);
          }),
        ),
      ),
    ),
    { initialValue: null },
  );

  onBack(): void {
    this.router.navigate(['/pharmacy-list']);
  }

   private createFavorite(pharmacyId: number): void {
    this.favoriteService.create(this.favoriteUserId!, { pharmacyId }).subscribe({
      next: () => {
        this.favoriteMessage.set('Added to favorites!');
        this.favoriteError.set(false);
        this.addingFavorite.set(false);
      },
      error: (error) => {
        this.favoriteMessage.set(
          error?.error?.detail || error?.error?.message || 'Failed to add favorite.'
        );
        this.favoriteError.set(true);
        this.addingFavorite.set(false);
      },
    });
  }

   addToFavorites(pharmacyId: number): void {
    if (!this.favoriteUserId) {
      this.favoriteMessage.set('Enter your user ID first.');
      this.favoriteError.set(true);
      return;
    }

    this.addingFavorite.set(true);
    this.favoriteMessage.set('');
    this.favoriteError.set(false);

    this.favoriteService.check(this.favoriteUserId, pharmacyId).subscribe({
      next: (already) => {
        if (already) {
          this.favoriteMessage.set('Already in your favorites.');
          this.favoriteError.set(true);
          this.addingFavorite.set(false);
          return;
        }
        this.createFavorite(pharmacyId);
      },
      error: () => this.createFavorite(pharmacyId),
    });
  }
}