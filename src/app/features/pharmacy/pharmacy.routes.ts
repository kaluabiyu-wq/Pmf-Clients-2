import { Routes } from '@angular/router';
import { hasPharmacyGuard, ownPharmacyGuard } from '../../guards/pharmacy-scope-guard';

export const PHARMACY_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', canActivate: [hasPharmacyGuard], loadComponent: () => import('./dashboard/pharmacy-dashboard.component').then(m => m.PharmacyDashboardComponent) },
  { path: 'inventory', canActivate: [hasPharmacyGuard], loadComponent: () => import('./inventory/inventory.component').then(m => m.InventoryComponent) },
  { path: 'inventory/:pharmacyId/:id', canActivate: [ownPharmacyGuard], loadComponent: () => import('./inventory-detail/inventory-detail.component').then(m => m.InventoryDetailComponent) },
  { path: 'pharmacy-document/:pharmacyId', canActivate: [ownPharmacyGuard], loadComponent: () => import('./pharmacy-document/pharmacy-document.componenet').then(m => m.PharmacyDocumentComponenet) },
  { path: 'users-feedback/:pharmacyId/:id', canActivate: [ownPharmacyGuard], loadComponent: () => import('./user-feedback/user-feedback.component').then(m => m.UserFeedbackComponent) },
  { path: 'users-feedback-list', canActivate: [hasPharmacyGuard], loadComponent: () => import('./user-feedback-list/user-feedback-list.component').then(m => m.UserFeedbackListComponent) },
];