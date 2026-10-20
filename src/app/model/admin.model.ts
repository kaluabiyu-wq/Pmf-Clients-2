export type AccountStatus = 'Active' | 'Suspended' | 'Inactive' | 'Deleted';

export interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  roleId: number;
  roleName: string;
  status: AccountStatus;
  createdAt: string;
  lastLoginAt: string | null;
  suspendedAt: string | null;
  suspensionReason: string | null;
  locationId: number;
  locationLabel: string;
  pharmacyId: number | null;
  pharmacyName: string | null;
}

export interface AdminUserDetail {
  user: AdminUser;
  orderCount: number;
  openOrderCount: number;
  reviewCount: number;
  favoriteCount: number;
}

export interface AdminUserQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  roleId?: number;
  status?: AccountStatus;
  orderBy?: 'FullName' | 'Email' | 'LastLoginAt' | 'CreatedAt';
  descending?: boolean;
}

export interface AdminUserCreateRequest {
  fullName: string;
  email: string;
  password?: string;
  roleId: number;
  locationId: number;
  sendResetEmail: boolean;
}

export interface AdminUserCreated {
  detail: AdminUserDetail;
  temporaryPassword: string | null;
  emailSent: boolean;
}

export interface RoleSummary {
  id: number;
  name: string;
  description: string | null;
  userCount: number;
  permissions: string[];
}

export interface AuditEntry {
  id: number;
  actorUserId: number;
  actorName: string;
  action: string;
  targetType: string;
  targetId: number;
  detail: string | null;
  createdAt: string;
}

export interface AuditQuery {
  page?: number;
  pageSize?: number;
  action?: string;
}

export interface AdminOverview {
  totalUsers: number;
  newUsersLast7Days: number;
  newUsersLast30Days: number;
  activeUsers: number;
  suspendedUsers: number;
  inactiveUsers: number;
  usersByRole: { name: string; count: number }[];
  signupsLast14Days: { date: string; count: number }[];
  totalPharmacies: number;
  verifiedPharmacies: number;
  unverifiedPharmacies: number;
  inactivePharmacies: number;
  medicinesInCatalogue: number;
  inventoryListings: number;
  pendingDocuments: number;
  rejectedDocuments: number;
  pendingPrescriptions: number;
  pendingOrders: number;
  recentActivity: AuditEntry[];
}

export interface SystemAlert {
  severity: 'Critical' | 'Warning' | 'Info';
  message: string;
}

export interface SystemHealth {
  status: 'Healthy' | 'Degraded' | 'Unhealthy';
  checkedAt: string;
  version: string;
  environment: string;
  uptimeSeconds: number;
  memoryMb: number;
  databaseOk: boolean;
  databaseLatencyMs: number;
  emailConfigured: boolean;
  alerts: SystemAlert[];
}