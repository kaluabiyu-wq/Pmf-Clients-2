import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pharmacy-dashboard',
    loadComponent: () =>
      import('./features/pharmacy-dashboard/pharmacy-dashboard.component').then(
        (m) => m.PharmacyDashboardComponent,
      ),
  },
  {
    path: 'add-medicine',
    loadComponent: () =>
      import('./features/add-medicine/add-medicine.component').then(
        (m) => m.AddMedicineComponent,
      ),
  },
  {
    path: 'medicine',
    loadComponent: () =>
      import('./features/medicine/medicine.component').then((m) => m.MedicineComponent),
  },
  {
    path: 'medicine/:id',
    loadComponent: () =>
      import('./features/medicine-detail/medicine-detail.component').then(
        (m) => m.MedicineDetailComponent,
      ),
  },
  {
    path: 'inventory',
    loadComponent: () =>
      import('./features/inventory/inventory.component')
    .then((m) => m.InventoryComponent),
  },
  {
    path: 'inventory/:pharmacyId/:id',
    loadComponent: () =>
      import('./features/inventory-detail/inventory-detail.component').then(
        (m) => m.InventoryDetailComponent),
  },
   {
    path: 'search',
    loadComponent: () =>
      import('./features/medicine-search/medicine-search.component')
    .then((m) => m.MedicineSearchComponent),
  },
  {
    path: 'search/:pharmacyId/:medicineId',
    loadComponent: () =>
      import('./features/medicine-search-detail/medicine-search-detail.component').then(
        (m) => m.MedicineSearchDetailComponent,
      ),
  },
  {
    path: 'pharmacy-list',
    loadComponent: () =>
      import('./features/pharmacy-list/pharmacy-list.component').then(
        (m) => m.PharmacyListComponent,
      ),
  },
  {
    path: 'pharmacy-list/:id',
    loadComponent: () =>
      import('./features/pharmacy-list-detail/pharmacy-list-detail.component').then(
        (m) => m.PharmacyListDetailComponent,
      ),
  },
 
  { path: '', redirectTo: 'pharmacy-dashboard', pathMatch: 'full' },

  { path: '**', redirectTo: 'pharmacy-dashboard' },
];