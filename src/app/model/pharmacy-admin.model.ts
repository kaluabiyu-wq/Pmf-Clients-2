import { PagedResponse } from './location.model';

export type VerifiedPharmacyCount = number;


export interface PharmacyCatalogueSize {
  name: string;
  itemCount: number;
}


export interface MedicineAveragePrice {
  medicine: string;
  averagePrice: number;
}


export type UncoveredMedicineName = string;


export interface TopPharmacyByInventory {
  medicine: number;
  medicineCount: number;
  reliablityScore: number;
  lowPrice: number;
}


export interface PharmacyDirectoryEntry {
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

export type PagedPharmacyDirectoryResponse = PagedResponse<PharmacyDirectoryEntry>;


export interface RankedPharmacy {
  pharmacyId: number;
  name: string;
  itemCount: number;
  reliablityScore: number;
  lowestPrice: number;
}


export interface PharmacyAdminDashboardSummary {
  verifiedPharmacyCount: number;
  totalPharmacyCount: number;
  pricedMedicineCount: number;
  uncoveredMedicineCount: number;
}