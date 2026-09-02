

export type InventoryStatus =
  | 'Fresh'
  | 'Available'
  | 'Low'
  | 'OutOfStock'
  | 'Expired'
  | (string & {});

/** One line in a pharmacy's own stock list — from GET /pharmacies/{id}/inventory/medicines */
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




/** A single inventory row — from GET/POST /pharmacies/{id}/inventory/... */
export interface InventoryRecord {
  id: number;
  medicineId: number;
  pharmacyId: number;
  updateUserId: number;
  price: number;
  status: InventoryStatus;
  lastUpdatedAt: string;
}

/** Body for POST /pharmacies/{pharmacyId}/inventory — mirrors InventoryRequest */
export interface CreateInventoryRequest {
  medicineId: number;
  updatebyUserId: number;
  price: number;
  status: InventoryStatus;
}

/** Body for an eventual PUT /pharmacies/{pharmacyId}/inventory/{id} (not yet in the API) */
export interface UpdateInventoryRequest {
  price: number;
  status: InventoryStatus;
  updatebyUserId: number;
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