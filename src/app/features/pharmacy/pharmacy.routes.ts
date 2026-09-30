import { Routes } from '@angular/router';

export const PHARMACY_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/pharmacy-dashboard.component').then(m => m.PharmacyDashboardComponent) },
  { path: 'inventory', loadComponent: () => import('./inventory/inventory.component').then(m => m.InventoryComponent) },
  { path: 'inventory/:pharmacyId/:id', loadComponent: () => import('./inventory-detail/inventory-detail.component').then(m => m.InventoryDetailComponent) },
  { path: 'pharmacy-document/:pharmacyId', loadComponent: () => import('./pharmacy-document/pharmacy-document.componenet').then(m => m.PharmacyDocumentComponenet) },
  { path: 'users-feedback/:pharmacyId/:id', loadComponent: () => import('./user-feedback/user-feedback.component').then(m => m.UserFeedbackComponent) },
  { path: 'users-feedback-list', loadComponent: () => import('./user-feedback-list/user-feedback-list.component').then(m => m.UserFeedbackListComponent) },
];