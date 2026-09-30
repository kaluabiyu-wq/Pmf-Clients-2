import { Routes } from '@angular/router';

export const SYSADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  { path: 'users', loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent) },
];