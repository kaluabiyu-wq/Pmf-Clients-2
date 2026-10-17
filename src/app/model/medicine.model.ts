export interface Medicine {
  id: number;
  genericName: string;
  brandName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  requiresPrescription: boolean;
  isActive: boolean;
}


export interface CreateMedicineRequest {
  genericName: string;
  brandName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  quantityEstimate?: number | null;
  requiresPrescription: boolean;
  notes?: string;
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
