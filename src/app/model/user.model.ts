
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