import { Routes } from '@angular/router';

export const PHARMACY_ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/pharmacy-admin-dashboard.component').then(m => m.PharmacyAdminDashboardComponent) },
  { path: 'manages', loadComponent: () => import('./pharmacy-admin-manages/pharmacy-admin-manages.component').then(m => m.PharmacyAdminManagesComponent) },
  { path: 'manages/:id', loadComponent: () => import('./pharmacy-admin-managesdetail/pharmacy-admin-managesdetail.componenet').then(m => m.PharmacyAdminManagesdetailComponenet) },
  { path: 'staff/:pharmacyId', loadComponent: () => import('./pharmacy-staff/pharmacy-staff.component').then(m => m.PharmacyStaffComponent) },

  // Medicine catalogue (same catalogue the patients browse) and the add form.
  { path: 'medicines', loadComponent: () => import('../patient/medicine/medicine.component').then(m => m.MedicineComponent) },
  { path: 'medicines/add', loadComponent: () => import('./add-medicine/add-medicine.component').then(m => m.AddMedicineComponent) },
  { path: 'medicines/:id', loadComponent: () => import('../patient/medicine-detail/medicine-detail.component').then(m => m.MedicineDetailComponent) },

  // One page per area; the admin picks the pharmacy (?pharmacyId=) and the view comes from route data.
  { path: 'inventory', data: { view: 'inventory' }, loadComponent: () => import('./pharmacy-scope/pharmacy-scope.component').then(m => m.PharmacyScopeComponent) },
  { path: 'orders', data: { view: 'orders' }, loadComponent: () => import('./pharmacy-scope/pharmacy-scope.component').then(m => m.PharmacyScopeComponent) },
  { path: 'users-feedback', data: { view: 'feedback' }, loadComponent: () => import('./pharmacy-scope/pharmacy-scope.component').then(m => m.PharmacyScopeComponent) },
];