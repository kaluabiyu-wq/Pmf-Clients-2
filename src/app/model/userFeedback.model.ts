
export interface UserFeedbackRequest {
  userId: number;
  inventoryId: number;
  pharmacyId: number;
  wasMedicineAvailable: boolean;
  comments?: string | null;
}


export interface UserFeedbackResponse {
  id: number;
  userId: number;
  inventoryId: number;
  pharmacyId: number;
  wasMedicineAvailable: boolean;
  comments: string | null;
  submittedAt: string;
}

export interface PagedFeedbackQuery {
  page?: number;
  pageSize?: number;
  orderBy?: 'SubmittedAt' | 'PharmacyId' | 'InventoryId';
  descending?: boolean;
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