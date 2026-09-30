import { Route, Routes } from '@angular/router';
import { guestGuard, homeRedirectGuard, roleGuard } from '../app/guards/role-guard';
import { ADMIN_AREA, PATIENT_AREA, PHARMACY_AREA } from '../app/features/auth/role-access';

//   patient  -> search, patient dashboard, inventory   (+ the detail pages they lead to)
//   pharmacy -> dashboard, medicine, add medicine      (+ medicine detail)
//   admin    -> everything
const patientArea: Route = { canActivate: [roleGuard], data: { roles: PATIENT_AREA } };
const pharmacyArea: Route = { canActivate: [roleGuard], data: { roles: PHARMACY_AREA } };
const adminArea: Route = { canActivate: [roleGuard], data: { roles: ADMIN_AREA } };

export const routes: Routes = [
  
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/login/login.componenet').then((m) => m.LoginComponent),
  },
  {
    path: 'signup/patient',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/signup-patient/signup-patient.componenet').then(
        (m) => m.SignupPatientComponent,
      ),
  },
  {
    path: 'signup/pharmacy',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/signup-pharmacy/signup-pharmacy.componenet').then(
        (m) => m.SignupPharmacyComponent,
      ),
  },
  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/unauthorized/unauthorized.componenet').then(
        (m) => m.UnauthorizedComponent,
      ),
  },

  
  {
    path: 'search',
    ...patientArea,
    loadComponent: () =>
      import('./features/medicine-search/medicine-search.component').then(
        (m) => m.MedicineSearchComponent,
      ),
  },
  {
    path: 'search/:pharmacyId/:medicineId',
    ...patientArea,
    loadComponent: () =>
      import('./features/medicine-search-detail/medicine-search-detail.component').then(
        (m) => m.MedicineSearchDetailComponent,
      ),
  },
  {
    path: 'patient-dashboard',
    ...patientArea,
    loadComponent: () =>
      import('./features/patient-dashboard/patient-dashboard.component').then(
        (m) => m.PatientDashboardComponent,
      ),
  },
  {
    path: 'inventory',
    ...patientArea,
    loadComponent: () =>
      import('./features/inventory/inventory.component').then((m) => m.InventoryComponent),
  },
  {
    path: 'inventory/:pharmacyId/:id',
    ...patientArea,
    loadComponent: () =>
      import('./features/inventory-detail/inventory-detail.component').then(
        (m) => m.InventoryDetailComponent,
      ),
  },
  {
    
    path: 'users-feedback/:pharmacyId/:id',
    ...patientArea,
    loadComponent: () =>
      import('./features/user-feedback/user-feedback.component').then(
        (m) => m.UserFeedbackComponent,
      ),
  },

  
  {
    path: 'pharmacy-dashboard',
    ...pharmacyArea,
    loadComponent: () =>
      import('./features/pharmacy-dashboard/pharmacy-dashboard.component').then(
        (m) => m.PharmacyDashboardComponent,
      ),
  },
  {
    path: 'medicine',
    ...pharmacyArea,
    loadComponent: () =>
      import('./features/medicine/medicine.component').then((m) => m.MedicineComponent),
  },
  {
    path: 'medicine/:id',
    ...pharmacyArea,
    loadComponent: () =>
      import('./features/medicine-detail/medicine-detail.component').then(
        (m) => m.MedicineDetailComponent,
      ),
  },
  {
    path: 'add-medicine',
    ...pharmacyArea,
    loadComponent: () =>
      import('./features/add-medicine/add-medicine.component').then(
        (m) => m.AddMedicineComponent,
      ),
  },

  
  {
    path: 'pharmacy-list',
    ...adminArea,
    loadComponent: () =>
      import('./features/pharmacy-list/pharmacy-list.component').then(
        (m) => m.PharmacyListComponent,
      ),
  },
  {
    path: 'pharmacy-list/:id',
    ...adminArea,
    loadComponent: () =>
      import('./features/pharmacy-list-detail/pharmacy-list-detail.component').then(
        (m) => m.PharmacyListDetailComponent,
      ),
  },
  {
    path: 'register',
    ...adminArea,
    loadComponent: () =>
      import('./features/user/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'users-list',
    ...adminArea,
    loadComponent: () =>
      import('./features/user-list/user-list.component').then((m) => m.UserListComponent),
  },
  {
    path: 'users-feedback-list',
    ...adminArea,
    loadComponent: () =>
      import('./features/user-feedback-list/user-feedback-list.component').then(
        (m) => m.UserFeedbackListComponent,
      ),
  },
  {
    path: 'pharmacy-document/:pharmacyId',
    ...adminArea,
    loadComponent: () =>
      import('./features/pharmacy-document/pharmacy-document.componenet').then(
        (m) => m.PharmacyDocumentComponenet,
      ),
  },
  {
    path: 'review/:pharmacyId',
    ...adminArea,
    loadComponent: () =>
      import('./features/review/review.component').then((m) => m.ReviewComponent),
  },
  {
    path: 'favourite/:userId',
    ...adminArea,
    loadComponent: () =>
      import('./features/favorite/favorite.component').then((m) => m.FavoriteComponent),
  },
  {
    path: 'pharmacy-admin',
    ...adminArea,
    loadComponent: () =>
      import('./features/pharmacy-admin-dashboard/pharmacy-admin-dashboard.component').then(
        (m) => m.PharmacyAdminDashboardComponent,
      ),
  },
  {
    path: 'pharmacy-admin-manages',
    ...adminArea,
    loadComponent: () =>
      import('./features/pharmacy-admin-manages/pharmacy-admin-manages.component').then(
        (m) => m.PharmacyAdminManagesComponent,
      ),
  },
  {
    path: 'pharmacy-admin-manages/:id',
    ...adminArea,
    loadComponent: () =>
      import(
        './features/pharmacy-admin-managesdetail/pharmacy-admin-managesdetail.componenet'
      ).then((m) => m.PharmacyAdminManagesdetailComponenet),
  },
  {
    path: 'pharmacy-staff/:pharmacyId',
    ...adminArea,
    loadComponent: () =>
      import('./features/pharmacy-staff/pharmacy-staff.component').then(
        (m) => m.PharmacyStaffComponent,
      ),
  },

   { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
  { path: '**', canActivate: [homeRedirectGuard], children: [] },
];