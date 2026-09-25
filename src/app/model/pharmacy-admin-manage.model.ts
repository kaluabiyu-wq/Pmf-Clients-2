import { PagedResponse } from './location.model';


export interface PharmacyAdminSummary {
  id: number;
  name: string;
  licenseNumber: string;
  isVerified: boolean;
  isActive: boolean;
  reliablityScore: number; 
  freshnessStatus: 'Fresh' | 'Stale' | string; 
  activeStaffCount: number;
  pendingDocumentCount: number;
  lastInventoryUpdatedAt: string; 
  registeredAt: string;
}

export type PagedPharmacyAdminSummaryResponse = PagedResponse<PharmacyAdminSummary>;



export interface PharmacyAdminProfile {
  id: number;
  name: string;
  licenseNumber: string;
  phoneNumber: number; 
  email: string | null;
  isVerified: boolean;
  isActive: boolean;
  reliablityScore: number;
  freshnessStatus: 'Fresh' | 'Stale' | string;
  freshnessThreshold: number; 
  lastInventoryUpdatedAt: string;
  registeredAt: string;
  locationId: number;
  totalStaffCount: number;
  activeStaffCount: number;
  inventoryItemCount: number;
  pendingDocumentCount: number;
  approvedDocumentCount: number;
  rejectedDocumentCount: number;
  reviewCount: number;
  averageRating: number | null; 
}


export interface PharmacyWriteResult {
  id: number;
  name: string;
  licenseNumber: string;
  locationId: number;
  isVerified: boolean;
  reliablityScore: number;
  freshnessThreshold: number;
  lastInventoryUpdatedAt: string;
  registeredAt: string;
}


export interface PharmacyUpdateRequest {
  name: string;
  licenseNumber: string;
  locationId: number;
  phoneNumber: number;
  email?: string | null;
  freshnessThreshold: number;
}

export interface PharmacyStatusUpdateRequest {
  isVerified: boolean;
  isActive: boolean;
  reason?: string | null;
}


export interface PharmacyAdminQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: 'Name' | 'LicenceNumber' | 'ReliabilityScore' | 'RegisteredAt';
  descending?: boolean;
  isVerified?: boolean;
  isActive?: boolean;
  freshness?: 'Fresh' | 'Stale';
}
