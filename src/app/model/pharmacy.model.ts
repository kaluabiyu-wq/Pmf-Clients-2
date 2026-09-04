import { Location as PmfLocation } from "./location.model";
export interface Pharmacy {
  id: number;
  name: string;
  licenseNumber: string;
   phoneNumber: string;
  email?: string;
  isVerified: boolean;
  reliabilityScore: number;
  isActive: boolean;
  freshnessThresholdHours: number;
  lastInventoryUpdateAt: string;
  locationId: number;
}
export interface PharmacyListItem extends Pharmacy {
  location: PmfLocation | null;
}


export interface PagedPharmacyQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: 'Name' | 'ReliabilityScore' | 'LastInventoryUpdateAt';
  descending?: boolean;
}
export interface PharmacyDetail {
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

export interface PharmacyMedicine {
  medicineId: number;
  genericName: string;
  brandName: string;
  category?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
  requiresPrescription: boolean;
  price: number;
  status: string;
  lastUpdatedAt: string;
}


