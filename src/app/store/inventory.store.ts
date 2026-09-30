import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { setAllEntities, withEntities } from '@ngrx/signals/entities';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, concatMap, EMPTY, pipe, tap } from 'rxjs';
import { InventoryService } from '../services/inventory.service';
import { CreateInventoryRequest, PharmacyMedicineDetail } from '../model/inventory.model';

type InventoryState = {
  isLoading: boolean;
  error: string | null;
  pharmacyId: number | null;
};

const initialState: InventoryState = {
  isLoading: false,
  error: null,
  pharmacyId: null,
};

export const InventoryStore = signalStore(
  { providedIn: 'root' },

  withState(initialState),

  
  withEntities<PharmacyMedicineDetail>(),

  withMethods((store, inventoryService = inject(InventoryService)) => ({
    loadForPharmacy: rxMethod<number>(
      pipe(
        tap((pharmacyId) => patchState(store, { isLoading: true, error: null, pharmacyId })),
        concatMap((pharmacyId) =>
          inventoryService.getMedicinesByPharmacy(pharmacyId).pipe(
            tap((rows) =>
              patchState(
                store,
                setAllEntities(rows, { selectId: (m) => m.medicineId }),
                { isLoading: false },
              ),
            ),
            catchError(() => {
              patchState(store, {
                isLoading: false,
                error: 'Could not load inventory for this pharmacy.',
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

    createInventory: rxMethod<{ pharmacyId: number; payload: CreateInventoryRequest }>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        concatMap(({ pharmacyId, payload }) =>
          inventoryService.create(pharmacyId, payload).pipe(
            concatMap(() =>
              inventoryService.getMedicinesByPharmacy(pharmacyId).pipe(
                tap((rows) =>
                  patchState(
                    store,
                    setAllEntities(rows, { selectId: (m) => m.medicineId }),
                    { isLoading: false },
                  ),
                ),
              ),
            ),
            catchError(() => {
              patchState(store, {
                isLoading: false,
                error: 'Could not add this medicine to inventory.',
              });
              return EMPTY;
            }),
          ),
        ),
      ),
    ),

   
  })),
);