import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { PharmacyListService } from '../../services/pharmacy-list.service';
import { DatePipe, DecimalPipe } from '@angular/common';
import { PharmacyMedicine } from '../../model/pharmacy.model';

@Component({
  selector: 'app-pharmacy-list-detail',
  imports: [DatePipe,DecimalPipe],
  templateUrl: './pharmacy-list-detail.component.html',
  styleUrl: './pharmacy-list-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PharmacyListDetailComponent {
  private readonly pharmacyListService = inject(PharmacyListService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  readonly medicines = signal<PharmacyMedicine[]>([]); 
  readonly medicinesLoading = signal(false);
  readonly medicinesError = signal<string | null>(null);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

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
}