import { RoleName } from '../../model/user.model';

/** Roles allowed in each area of the app. Change access here and both routes and navbar follow. */
export const PATIENT_AREA: readonly RoleName[] = ['Patient','PharmacyAdmin'];
export const PHARMACY_AREA: readonly RoleName[] = ['Pharmacy','PharmacyAdmin'];
export const PHARMACY_ADMIN_AREA: readonly RoleName[] = ['PharmacyAdmin'];
export const SYSADMIN_AREA: readonly RoleName[] = ['SysAdmin','PharmacyAdmin'];

export interface NavItem {
  label: string;
  path: string;
  roles: readonly RoleName[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  // Patient
  { label: 'Dashboard', path: '/patient/dashboard', roles: PATIENT_AREA },
  { label: 'Search', path: '/patient/search', roles: PATIENT_AREA },
  { label: 'Medicine', path: '/patient/medicine', roles: PATIENT_AREA },
  { label: 'Pharmacies', path: '/patient/pharmacy-list', roles: PATIENT_AREA },

  // Pharmacy owner
  { label: 'Dashboard', path: '/pharmacy/dashboard', roles: PHARMACY_AREA },
  { label: 'Inventory', path: '/pharmacy/inventory', roles: PHARMACY_AREA },
  { label: 'Users-Feedback', path: '/pharmacy/users-feedback-list', roles: PHARMACY_AREA },

  // Pharmacy admin
  { label: 'Dashboard', path: '/pharmacy-admin/dashboard', roles: PHARMACY_ADMIN_AREA },
  { label: 'Pharmacy-manages', path: '/pharmacy-admin/manages', roles: PHARMACY_ADMIN_AREA },
  { label: 'Pharmacies', path: '/patient/pharmacy-list', roles: PHARMACY_ADMIN_AREA },
  { label: 'Add Medicine', path: '/pharmacy-admin/medicines/add', roles: PHARMACY_ADMIN_AREA },
  { label: 'Inventory', path: '/pharmacy/inventory', roles: PHARMACY_ADMIN_AREA },
  { label: 'Users-Feedback', path: '/pharmacy/users-feedback-list', roles: PHARMACY_ADMIN_AREA },
  

  // System admin
  { label: 'Users', path: '/sysadmin/users', roles: SYSADMIN_AREA },
  { label: 'Create Account', path: '/register', roles: SYSADMIN_AREA },
];

/** Where each role lands after login. */
export function homeFor(role: RoleName | null | undefined): string {
  switch (role) {
    case 'Patient':
      return '/patient/dashboard';
    case 'Pharmacy':
      return '/pharmacy/dashboard';
    case 'PharmacyAdmin':
      return '/pharmacy-admin';
    case 'SysAdmin':
      return '/sysadmin';
    default:
      return '/login';
  }
}