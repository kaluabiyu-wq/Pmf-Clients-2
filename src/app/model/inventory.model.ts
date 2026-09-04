

export type InventoryStatus =
  | 'Fresh'
  | 'Available'
  | 'Low'
  | 'OutOfStock'
  | 'Expired'
  | (string & {});

/** pharmacy's own stock list **/
export interface PharmacyMedicineDetail {
  medicineId: number;
  genericName: string;
  brandName: string;
  category?: string | null;
  dosageForm?: string | null;
  strength?: string | null;
  requiresPrescription: boolean;
  price: number;
  status: InventoryStatus;
  lastUpdatedAt: string;
  pharmacyName?: string | null;   
  pharmacyId?: number | null;     
  locationLabel?: string | null;  
  distanceKm?: number | null; 
}
export interface PharmacyInventoryDetail {
  pharmacyId: number;
  price: number;
  status: InventoryStatus;
  lastUpdatedAt: string;
}

export interface MedicinePharmacyInventoryResponse {
  medicineId: number;
  genericName: string;
  brandName: string | null;
  category: string | null;
  dosageForm: string | null;
  strength: string | null;
  requiresPrescription: boolean;
  pharmacies: PharmacyInventoryDetail[];
}




/** A single inventory row —  */
export interface InventoryRecord {
  id: number;
  medicineId: number;
  pharmacyId: number;
  updateUserId: number;
  price: number;
  status: InventoryStatus;
  lastUpdatedAt: string;
}


export interface CreateInventoryRequest {
  medicineId: number;
  updatebyUserId: number;
  price: number;
  status: InventoryStatus;
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