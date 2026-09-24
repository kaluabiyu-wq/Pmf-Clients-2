import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { PharmacyListService } from '../../services/pharmacy-list.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-pharmacy-list-detail',
  imports: [DatePipe],
  templateUrl: './pharmacy-list-detail.component.html',
  styleUrl: './pharmacy-list-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PharmacyListDetailComponent {
  private readonly pharmacyListService = inject(PharmacyListService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly pharmacy = toSignal(
    this.route.paramMap.pipe(
      map((params) => Number(params.get('id'))),
      switchMap((id) =>
        this.pharmacyListService.getById(id).pipe(
          tap(() => {
            this.isLoading.set(false);
            this.loadError.set(null);
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