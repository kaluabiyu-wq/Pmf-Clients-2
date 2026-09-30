import { RoleName } from '../../model/user.model';

/** Roles allowed in each area of the app. Change access here and both routes and navbar follow. */
export const PATIENT_AREA: readonly RoleName[] = ['Patient', 'Admin'];
export const PHARMACY_AREA: readonly RoleName[] = ['Pharmacy', 'PharmacyStaff', 'Admin'];
export const ADMIN_AREA: readonly RoleName[] = ['Admin'];

export interface NavItem {
  label: string;
  path: string;
  roles: readonly RoleName[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  // Patient
  { label: 'Search', path: '/search', roles: PATIENT_AREA },
  { label: 'Patient', path: '/patient-dashboard', roles: PATIENT_AREA },
  { label: 'Inventory', path: '/inventory', roles: PATIENT_AREA },

  // Pharmacy owner
  { label: 'Dashboard', path: '/pharmacy-dashboard', roles: PHARMACY_AREA },
  { label: 'Medicine', path: '/medicine', roles: PHARMACY_AREA },
  { label: 'Add Medicine', path: '/add-medicine', roles: PHARMACY_AREA },

  // Admin only
  { label: 'Pharmacies', path: '/pharmacy-list', roles: ADMIN_AREA },
  { label: 'Users', path: '/users-list', roles: ADMIN_AREA },
  { label: 'Users-Feedback', path: '/users-feedback-list', roles: ADMIN_AREA },
  { label: 'Pharmacy-admin', path: '/pharmacy-admin', roles: ADMIN_AREA },
  { label: 'Pharmacy-manages', path: '/pharmacy-admin-manages', roles: ADMIN_AREA },
  { label: 'Create Account', path: '/register', roles: ADMIN_AREA },
];

/** Where each role lands after login. */
export function homeFor(role: RoleName | null): string {
  switch (role) {
    case 'Patient':
      return '/patient-dashboard';
    case 'Pharmacy':
    case 'PharmacyStaff':
      return '/pharmacy-dashboard';
    case 'Admin':
      return '/pharmacy-admin';
    default:
      return '/login';
  }
}