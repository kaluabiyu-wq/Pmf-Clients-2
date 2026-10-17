import { Routes } from '@angular/router';
import { roleGuard } from '../../guards/role-guard';
import { PATIENT_AREA, PATIENT_SECTION_ACCESS } from '../auth/role-access';

/** Patient-only pages. */
const patientOnly = { canActivate: [roleGuard], data: { roles: PATIENT_AREA } };
/** Pages a PharmacyAdmin may also open (pharmacy directory and its reviews/favourites). */
const patientOrPharmacyAdmin = { canActivate: [roleGuard], data: { roles: PATIENT_SECTION_ACCESS } };

export const PATIENT_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', ...patientOnly, loadComponent: () => import('./dashboard/patient-dashboard.component').then(m => m.PatientDashboardComponent) },
  { path: 'search', ...patientOnly, loadComponent: () => import('./medicine-search/medicine-search.component').then(m => m.MedicineSearchComponent) },
  { path: 'search/:pharmacyId/:medicineId', ...patientOnly, loadComponent: () => import('./medicine-search-detail/medicine-search-detail.component').then(m => m.MedicineSearchDetailComponent) },
  { path: 'medicine', ...patientOnly, loadComponent: () => import('./medicine/medicine.component').then(m => m.MedicineComponent) },
  { path: 'medicine/:id', ...patientOnly, loadComponent: () => import('./medicine-detail/medicine-detail.component').then(m => m.MedicineDetailComponent) },
  { path: 'pharmacy-list', ...patientOrPharmacyAdmin, loadComponent: () => import('./pharmacy-list/pharmacy-list.component').then(m => m.PharmacyListComponent) },
  { path: 'pharmacy-list/:id', ...patientOrPharmacyAdmin, loadComponent: () => import('./pharmacy-list-detail/pharmacy-list-detail.component').then(m => m.PharmacyListDetailComponent) },
  { path: 'review/:pharmacyId', ...patientOrPharmacyAdmin, loadComponent: () => import('./review/review.component').then(m => m.ReviewComponent) },
  { path: 'favourite/:userId', ...patientOrPharmacyAdmin, loadComponent: () => import('./favorite/favorite.component').then(m => m.FavoriteComponent) },
  { path: 'orders', ...patientOnly, loadComponent: () => import('./orders/orders.componenet').then(m => m.OrdersComponenet) },
  { path: 'orders/:id', ...patientOnly, loadComponent: () => import('./order-detail/order-detail.componenet').then(m => m.OrderDetailComponent) },
];