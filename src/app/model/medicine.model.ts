export interface Medicine {
  id: number;
  genericName: string;
  brandName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  price?: number;
  requiresPrescription: boolean;
  isActive: boolean;
}

// Separate request DTO — the add-medicine form should never post an `id`
// or `isActive`, so it gets its own shape rather than reusing Medicine.
export interface CreateMedicineRequest {
  genericName: string;
  brandName?: string;
  category?: string;
  dosageForm?: string;
  strength?: string;
  price?: number | null;
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
