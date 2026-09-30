import { Routes } from '@angular/router';

export const PATIENT_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent) },
  { path: 'search', loadComponent: () => import('./medicine-search/medicine-search.component').then(m => m.MedicineSearchComponent) },
  { path: 'search/:pharmacyId/:medicineId', loadComponent: () => import('./medicine-search-detail/medicine-search-detail.component').then(m => m.MedicineSearchDetailComponent) },
  { path: 'medicine', loadComponent: () => import('./medicine/medicine.component').then(m => m.MedicineComponent) },
  { path: 'medicine/:id', loadComponent: () => import('./medicine-detail/medicine-detail.component').then(m => m.MedicineDetailComponent) },
  { path: 'pharmacy-list', loadComponent: () => import('./pharmacy-list/pharmacy-list.component').then(m => m.PharmacyListComponent) },
  { path: 'pharmacy-list/:id', loadComponent: () => import('./pharmacy-list-detail/pharmacy-list-detail.component').then(m => m.PharmacyListDetailComponent) },
  { path: 'review/:pharmacyId', loadComponent: () => import('./review/review.component').then(m => m.ReviewComponent) },
  { path: 'favourite/:userId', loadComponent: () => import('./favorite/favorite.component').then(m => m.FavoriteComponent) },
];