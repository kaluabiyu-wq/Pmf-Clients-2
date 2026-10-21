import { Routes } from '@angular/router';

export const SYSADMIN_ROUTES: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', loadComponent: () => import('./overview/overview.component').then(m => m.OverviewComponent) },
  { path: 'users', loadComponent: () => import('./user-list/user-list.component').then(m => m.UserListComponent) },
  { path: 'users/new', loadComponent: () => import('./user-create/user-create.component').then(m => m.UserCreateComponent) },
  { path: 'users/:id', loadComponent: () => import('./user-detail/user-detail.component').then(m => m.UserDetailComponent) },
  { path: 'roles', loadComponent: () => import('./roles/roles.component').then(m => m.RolesComponent) },
  { path: 'audit', loadComponent: () => import('./audit/audit.component').then(m => m.AuditComponent) },
];