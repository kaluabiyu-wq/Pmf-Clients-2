import { RoleName } from '../../model/user.model';

/**
 * Who sees a nav button (one area per role) vs. who may open a route section.
 * The *_AREA lists drive the navbar and the page-level guards. The *_SECTION_ACCESS lists
 * are only for the parent route of a section that PharmacyAdmin enters for a few shared pages.
 */
export const PATIENT_AREA: readonly RoleName[] = ['Patient'];
export const PHARMACY_AREA: readonly RoleName[] = ['Pharmacy'];
export const PHARMACY_ADMIN_AREA: readonly RoleName[] = ['PharmacyAdmin'];
export const SYSADMIN_AREA: readonly RoleName[] = ['SysAdmin'];

/** Parent-route access: PharmacyAdmin reaches the shared pharmacy pages; children narrow it further. */
export const PATIENT_SECTION_ACCESS: readonly RoleName[] = ['Patient', 'PharmacyAdmin'];
export const PHARMACY_SECTION_ACCESS: readonly RoleName[] = ['Pharmacy', 'PharmacyAdmin'];

export interface NavItem {
  label: string;
  path: string;
  roles: readonly RoleName[];
}

export const NAV_ITEMS: readonly NavItem[] = [
  // Patient
  { label: 'Dashboard', path: '/patient/dashboard', roles: PATIENT_AREA },
  { label: 'Medicine', path: '/patient/medicine', roles: PATIENT_AREA },
  { label: 'Pharmacies', path: '/patient/pharmacy-list', roles: PATIENT_AREA },
  { label: 'My Orders', path: '/patient/orders', roles: PATIENT_AREA },

  // Pharmacy owner
  { label: 'Dashboard', path: '/pharmacy/dashboard', roles: PHARMACY_AREA },
  { label: 'Inventory', path: '/pharmacy/inventory', roles: PHARMACY_AREA },
  { label: 'Orders', path: '/pharmacy/orders', roles: PHARMACY_AREA },
  { label: 'Prescriptions', path: '/pharmacy/prescriptions', roles: PHARMACY_AREA },
  { label: 'Users-Feedback', path: '/pharmacy/users-feedback-list', roles: PHARMACY_AREA },
  { label: 'My Pharmacy', path: '/pharmacy/my-pharmacy', roles: PHARMACY_AREA },

  // Pharmacy admin (platform-wide: picks a pharmacy on the inventory, orders and feedback pages)
  { label: 'Dashboard', path: '/pharmacy-admin/dashboard', roles: PHARMACY_ADMIN_AREA },
  { label: 'Pharmacy-manages', path: '/pharmacy-admin/manages', roles: PHARMACY_ADMIN_AREA },
  { label: 'Pharmacies', path: '/patient/pharmacy-list', roles: PHARMACY_ADMIN_AREA },
  { label: 'Medicine', path: '/pharmacy-admin/medicines', roles: PHARMACY_ADMIN_AREA },
  { label: 'Add Medicine', path: '/pharmacy-admin/medicines/add', roles: PHARMACY_ADMIN_AREA },
  { label: 'Inventory', path: '/pharmacy-admin/inventory', roles: PHARMACY_ADMIN_AREA },
  { label: 'Approve', path: '/pharmacy-admin/inventory-approvals', roles: PHARMACY_ADMIN_AREA },
  { label: 'Orders', path: '/pharmacy-admin/orders', roles: PHARMACY_ADMIN_AREA },
  { label: 'Users-Feedback', path: '/pharmacy-admin/users-feedback', roles: PHARMACY_ADMIN_AREA },

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