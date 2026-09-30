import { Routes } from '@angular/router';
import { guestGuard, homeRedirectGuard, roleGuard } from './guards/role-guard';
import {
  PATIENT_AREA,
  PHARMACY_AREA,
  PHARMACY_ADMIN_AREA,
  SYSADMIN_AREA,
} from './features/auth/role-access';

export const routes: Routes = [
  // ---------- Public (guests only) ----------
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

  // ---------- Role areas ----------
  {
    // Was unguarded before; restricted to SysAdmin. Use guestGuard instead if it's a public signup.
    path: 'register',
    canActivate: [roleGuard],
    data: { roles: SYSADMIN_AREA },
    loadComponent: () =>
      import('./features/public/user/user.component').then((m) => m.UserComponent),
  },
  {
    path: 'patient',
    canActivate: [roleGuard],
    data: { roles: PATIENT_AREA },
    loadChildren: () =>
      import('./features/patient/patient.routes').then((m) => m.PATIENT_ROUTES),
  },
  {
    path: 'pharmacy',
    canActivate: [roleGuard],
    data: { roles: PHARMACY_AREA },
    loadChildren: () =>
      import('./features/pharmacy/pharmacy.routes').then((m) => m.PHARMACY_ROUTES),
  },
  {
    path: 'pharmacy-admin',
    canActivate: [roleGuard],
    data: { roles: PHARMACY_ADMIN_AREA },
    loadChildren: () =>
      import('./features/pharmacy-admin/pharmacy-admin.routes').then(
        (m) => m.PHARMACY_ADMIN_ROUTES,
      ),
  },
  {
    path: 'sysadmin',
    canActivate: [roleGuard],
    data: { roles: SYSADMIN_AREA },
    loadChildren: () =>
      import('./features/sysadmin/sysadmin.routes').then((m) => m.SYSADMIN_ROUTES),
  },

  // ---------- Fallbacks ----------
  { path: '', pathMatch: 'full', canActivate: [homeRedirectGuard], children: [] },
  { path: '**', canActivate: [homeRedirectGuard], children: [] },
];