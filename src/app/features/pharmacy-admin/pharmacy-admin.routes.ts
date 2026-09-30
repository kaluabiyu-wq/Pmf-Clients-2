import { Routes } from '@angular/router';

export const PHARMACY_ADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  { path: 'dashboard', loadComponent: () => import('./dashboard/pharmacy-admin-dashboard.component').then(m => m.PharmacyAdminDashboardComponent) },
  { path: 'manages', loadComponent: () => import('./pharmacy-admin-manages/pharmacy-admin-manages.component').then(m => m.PharmacyAdminManagesComponent) },
  { path: 'manages/:id', loadComponent: () => import('./pharmacy-admin-managesdetail/pharmacy-admin-managesdetail.componenet').then(m => m.PharmacyAdminManagesdetailComponenet) },
  { path: 'staff/:pharmacyId', loadComponent: () => import('./pharmacy-staff/pharmacy-staff.component').then(m => m.PharmacyStaffComponent) },
  { path: 'medicines/add', loadComponent: () => import('./add-medicine/add-medicine.component').then(m => m.AddMedicineComponent) },
];