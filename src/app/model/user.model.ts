
export interface User {
  id: number;
  fullName: string;
  email: string;
  locationId: number;
  roleId: number;
  isActive: boolean;
  createdAt: string;
}


export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  locationId: number;
  roleId: number;
}


export interface PagedUserQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: 'FullName' | 'Email';
  descending?: boolean;
}

export interface PagedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}


export interface RoleOption {
  id: number;
  name: string;
}

export const USER_ROLES: readonly RoleOption[] = [
  { id: 1, name: 'Patient' },
  { id: 2, name: 'Pharmacy' },
  { id: 3, name: 'PharmacyStaff' },
  { id: 4, name: 'Admin' },
];

export type RoleName = 'Patient' | 'Pharmacy' | 'PharmacyStaff' | 'Admin';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
}


export interface AuthUser {
  id: number | null;
  email: string | null;
  role: RoleName | null;
}

export interface RegisterPatientRequest {
  fullName: string;
  email: string;
  password: string;
  locationId: number;
}

export type PharmacyDocumentType = 'License' | 'BusinessRegistration' | 'PharmacistCredential';

export interface RegisterPharmacyForm {
  fullName: string;
  email: string;
  password: string;
  locationId: number;
  pharmacyName: string;
  address: string;
  phoneNumber: string;
  license: File;
  businessRegistration: File;
  pharmacistCredential: File;
}