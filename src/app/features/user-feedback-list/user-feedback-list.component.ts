import { Component, OnInit, effect, inject, signal, viewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { UserFeedbackService } from '../../services/user-feedback.service';
import { PharmacyListService } from '../../services/pharmacy-list.service';
import { InventoryService } from '../../services/inventory.service';
import { MedicineService } from '../../services/medicine.service';

import { UserFeedbackResponse } from '../../model/userFeedback.model';
import { InventoryRecord } from '../../model/inventory.model';


interface EnrichedFeedback extends UserFeedbackResponse {
  medicineName: string;
  pharmacyName: string;
}

interface FeedbackNameMaps {
  pharmacyNames: Map<number, string>;
  medicineNamesByInventoryKey: Map<string, string>;
}

@Component({
  selector: 'app-user-feedback-list',
  standalone: true,
  imports: [MatPaginator, MatSortModule],
  templateUrl: './user-feedback-list.component.html',
  styleUrl: './user-feedback-list.component.scss',
})
export class UserFeedbackListComponent implements OnInit {
  private readonly userFeedbackService = inject(UserFeedbackService);
  private readonly pharmacyListService = inject(PharmacyListService);
  private readonly inventoryService = inject(InventoryService);
  private readonly medicineService = inject(MedicineService);

  feedback = signal<EnrichedFeedback[]>([]);

  loading = signal(false);
  error = signal('');

  readonly feedbackDataSource = new MatTableDataSource<EnrichedFeedback>([]);

  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  readonly pagedFeedback = toSignal(this.feedbackDataSource.connect(), {
    initialValue: [] as EnrichedFeedback[],
  });

  constructor() {
    this.feedbackDataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'medicineName':
          return item.medicineName ?? '';
        case 'pharmacyName':
          return item.pharmacyName ?? '';
        case 'wasMedicineAvailable':
            return item.wasMedicineAvailable ? 1 : 0;
        case 'submittedAt':
          return item.submittedAt ? new Date(item.submittedAt).getTime() : 0;
        default:
          return '';
      }
    };

    effect(() => {
      this.feedbackDataSource.data = this.feedback();
    });

    effect(() => {
      this.feedbackDataSource.paginator = this.paginator();
      this.feedbackDataSource.sort = this.sort();
    });
  }

  ngOnInit(): void {
    this.loadFeedback();
  }

  loadFeedback(): void {
    this.loading.set(true);
    this.error.set('');

    this.userFeedbackService
      .getAll({ page: 1, pageSize: 1000 })
      .pipe(
        switchMap((paged) => {
          const items = paged.items ?? [];

          if (items.length === 0) {
            return of({ items, pharmacyNames: new Map<number, string>(), medicineNamesByInventoryKey: new Map<string, string>() });
          }

          return this.resolveNames(items).pipe(map((maps) => ({ items, ...maps })));
        }),
      )
      .subscribe({
        next: ({ items, pharmacyNames, medicineNamesByInventoryKey }) => {
          this.feedback.set(this.enrich(items, pharmacyNames, medicineNamesByInventoryKey));
          this.loading.set(false);
        },

        error: (error) => {
          console.error('Failed to load user feedback:', error);

          this.error.set(
            error?.error?.detail ||
              error?.error?.message ||
              'Failed to load user feedback.',
          );

          this.loading.set(false);
        },
      });
  }

  refresh(): void {
    this.loadFeedback();
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString();
  }

  private resolveNames(items: UserFeedbackResponse[]): Observable<FeedbackNameMaps> {
    const pharmacyNames$ = this.pharmacyListService.getAll({ pageSize: 200 }).pipe(
      map((response) => new Map(response.items.map((pharmacy) => [pharmacy.id, pharmacy.name]))),
      catchError(() => of(new Map<number, string>())),
    );

    const distinctInventoryPairs = Array.from(
      new Map(
        items.map((row) => [
          `${row.pharmacyId}:${row.inventoryId}`,
          { pharmacyId: row.pharmacyId, inventoryId: row.inventoryId },
        ]),
      ).values(),
    );

    const inventoryRecords$: Observable<InventoryRecord[]> =
      distinctInventoryPairs.length === 0
        ? of([])
        : forkJoin(
            distinctInventoryPairs.map((pair) =>
              this.inventoryService
                .getById(pair.pharmacyId, pair.inventoryId)
                .pipe(catchError(() => of(null))),
            ),
          ).pipe(
            map((records) => records.filter((record): record is InventoryRecord => record !== null)),
          );

    return forkJoin({ pharmacyNames: pharmacyNames$, inventoryRecords: inventoryRecords$ }).pipe(
      switchMap(({ pharmacyNames, inventoryRecords }) => {
        const distinctMedicineIds = Array.from(new Set(inventoryRecords.map((record) => record.medicineId)));

        const medicineNamesById$: Observable<Map<number, string>> =
          distinctMedicineIds.length === 0
            ? of(new Map<number, string>())
            : forkJoin(
                distinctMedicineIds.map((medicineId) =>
                  this.medicineService.getById(medicineId).pipe(
                    map((medicine) => ({ medicineId, name: medicine.genericName })),
                    catchError(() => of({ medicineId, name: '' })),
                  ),
                ),
              ).pipe(map((results) => new Map(results.map((result) => [result.medicineId, result.name]))));

        return medicineNamesById$.pipe(
          map((medicineNamesById) => {
            const medicineNamesByInventoryKey = new Map<string, string>();

            for (const record of inventoryRecords) {
              const name = medicineNamesById.get(record.medicineId);
              if (name) {
                medicineNamesByInventoryKey.set(`${record.pharmacyId}:${record.id}`, name);
              }
            }

            return { pharmacyNames, medicineNamesByInventoryKey };
          }),
        );
      }),
    );
  }

  private enrich(
    items: UserFeedbackResponse[],
    pharmacyNames: Map<number, string>,
    medicineNamesByInventoryKey: Map<string, string>,
  ): EnrichedFeedback[] {
    return items.map((row) => ({
      ...row,
      pharmacyName: pharmacyNames.get(row.pharmacyId) ?? `Pharmacy #${row.pharmacyId}`,
      medicineName:
        medicineNamesByInventoryKey.get(`${row.pharmacyId}:${row.inventoryId}`) ??
        `Inventory #${row.inventoryId}`,
    }));
  }
}