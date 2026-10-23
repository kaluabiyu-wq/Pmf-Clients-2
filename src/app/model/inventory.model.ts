

export type InventoryStatus =
  | 'Fresh'
  | 'Available'
  | 'Low'
  | 'OutOfStock'
  | 'Expired'
  | (string & {});


export interface PharmacyMedicineDetail {
  inventoryId:number;
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
  name?: string | null;
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




export interface InventoryRecord {
  id: number;
  medicineId: number;
  pharmacyId: number;
  updatebyUserId: number;
  price: number;
  status: InventoryStatus;
  lastUpdatedAt: string;
}



export interface CreateInventoryRequest {
  medicineId: number;
  price: number;
  updatebyUserId?: number;
  status?: InventoryStatus;
}

export type ApprovalStatus = 'Pending' | 'Approved' | 'Rejected';

export interface InventorySubmission {
  id: number;
  pharmacyId: number;
  pharmacyName: string;
  medicineId: number;
  genericName: string;
  brandName: string;
  category: string | null;
  dosageForm: string | null;
  strength: string | null;
  requiresPrescription: boolean;
  price: number;
  approvalStatus: ApprovalStatus;
  rejectionReason: string | null;
  submittedByUserId: number;
  lastUpdatedAt: string;
  reviewedAt: string | null;
}
export interface UpdateInventoryRequest {
  price?:number;
  status?: InventoryStatus;
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



export interface InventoryPriceChange {
  id: number;
  inventoryId: number;
  medicineId: number;
  pharmacyId: number;
  changedByUserId: number;
  changedByName: string | null;
  oldPrice: number;
  newPrice: number;
  changedAt: string;
}

export interface PagedHistoryQuery {
  page?: number;
  pageSize?: number;
  descending?: boolean;
}