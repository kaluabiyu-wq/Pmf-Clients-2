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

/**
 * PharmaciesController's GetPharmacy action binds [FromQuery] PagedRequest —
 * the same shared PmfApi.Application.Dtos.PagedRequest used by
 * LocationController, so page/pageSize/search/orderBy/descending all apply.
 * orderBy values below are a best guess at Pharmacy's sortable columns —
 * confirm against PagedRequest's actual validation/allow-list on the backend.
 */
export interface PagedPharmacyQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: 'Name' | 'ReliabilityScore' | 'LastInventoryUpdateAt';
  descending?: boolean;
}
