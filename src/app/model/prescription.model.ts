import { PagedResponse } from './inventory.model';
import { VerificationStatus } from './order.model';

export type { VerificationStatus };

/** POST /orders/{orderId}/prescriptions — the API stores a link, not an uploaded file. */
export interface PrescriptionRequest {
  fileUrl: string; // absolute http(s) URL, max 2048 chars
}

/** PATCH /prescriptions/{id}/review */
export interface PrescriptionReviewRequest {
  verificationStatus: Extract<VerificationStatus, 'Approved' | 'Rejected'>;
  note?: string; // required when rejecting, max 500 chars
}

export interface PrescriptionResponse {
  id: number;
  orderId: number;
  fileUrl: string;
  submittedAt: string;
  verificationStatus: VerificationStatus;
  verifiedByUserId: number | null;
  verifiedAt: string | null;
  reviewNote: string | null;
}

/** Query string for GET /pharmacies/{id}/prescriptions */
export interface PrescriptionListQuery {
  status?: VerificationStatus;
  page?: number;
  pageSize?: number;
}

export type PrescriptionPage = PagedResponse<PrescriptionResponse>;

export const MAX_FILE_URL_LENGTH = 2048;
export const MAX_REVIEW_NOTE_LENGTH = 500;
