
export interface ReviewRequest {
  userId: number;
  rating: number; // 1-5, enforced server-side by [Range(1, 5)]
  comment?: string | null;
}


export interface ReviewResponse {
  id: number;
  userId: number;
  pharmacyId: number;
  rating: number;
  comment: string | null;
  submittedAt: string;
}


export interface PagedReviewQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: string;
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