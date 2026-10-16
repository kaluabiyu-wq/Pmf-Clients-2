import { Routes } from '@angular/router';
import { hasPharmacyGuard, ownPharmacyGuard } from '../../guards/pharmacy-scope-guard';

export const PHARMACY_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', canActivate: [hasPharmacyGuard], loadComponent: () => import('./dashboard/pharmacy-dashboard.component').then(m => m.PharmacyDashboardComponent) },
  { path: 'inventory', canActivate: [hasPharmacyGuard], loadComponent: () => import('./inventory/inventory.component').then(m => m.InventoryComponent) },
  { path: 'inventory/:pharmacyId/:id', canActivate: [ownPharmacyGuard], loadComponent: () => import('./inventory-detail/inventory-detail.component').then(m => m.InventoryDetailComponent) },
  { path: 'inventory/:pharmacyId/:id/edit',canActivate: [ownPharmacyGuard],loadComponent: () => import('./inventoryedit/inventoryedit.componenet').then(m => m.InventoryEditComponent),},
  { path: 'pharmacy-document/:pharmacyId', canActivate: [ownPharmacyGuard], loadComponent: () => import('./pharmacy-document/pharmacy-document.componenet').then(m => m.PharmacyDocumentComponenet) },
  { path: 'users-feedback/:pharmacyId/:id', canActivate: [ownPharmacyGuard], loadComponent: () => import('./user-feedback/user-feedback.component').then(m => m.UserFeedbackComponent) },
  { path: 'users-feedback-list', canActivate: [hasPharmacyGuard], loadComponent: () => import('./user-feedback-list/user-feedback-list.component').then(m => m.UserFeedbackListComponent) },
  { path: 'orders', canActivate: [hasPharmacyGuard], loadComponent: () => import('./pharmacy-orders/pharmacy-orders.componenet').then(m => m.PharmacyOrdersComponent) },
  { path: 'prescriptions', canActivate: [hasPharmacyGuard], loadComponent: () => import('./prescription-queue/prescription-queue.component').then(m => m.PrescriptionQueueComponent) },
];
