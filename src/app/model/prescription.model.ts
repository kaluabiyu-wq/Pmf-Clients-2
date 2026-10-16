import { PagedResponse } from './inventory.model';
import { VerificationStatus } from './order.model';

export type { VerificationStatus };

/**
 * POST /orders/{orderId}/prescriptions — the link form. The UI now uploads the file itself
 * (POST /orders/{orderId}/prescriptions/upload); this stays for API parity and old rows.
 */
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
  /**
   * Either an absolute http(s) link (old link submissions) or, for uploads, a private relative
   * path such as "prescriptions/<guid>.pdf" that is NOT browsable. Read uploads through
   * GET /prescriptions/{id}/file (see PrescriptionService.openFile), never as an href.
   */
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

/** Mirrors LocalFileStorage: .pdf/.jpg/.jpeg/.png, non-empty, up to 5 MB. */
export const MAX_PRESCRIPTION_FILE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_PRESCRIPTION_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'] as const;
/** Value for <input type="file" accept>. */
export const PRESCRIPTION_ACCEPT = ALLOWED_PRESCRIPTION_EXTENSIONS.join(',');

/** True when fileUrl is an old-style link; false when it is a file the API stored privately. */
export function isPrescriptionLink(fileUrl: string): boolean {
  return /^https?:\/\//i.test(fileUrl);
}

/** Returns a message the user can act on, or null when the file would be accepted. */
export function prescriptionFileError(file: File | null): string | null {
  if (!file) return 'Choose a photo or PDF of your prescription.';
  const dot = file.name.lastIndexOf('.');
  const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : '';
  if (!(ALLOWED_PRESCRIPTION_EXTENSIONS as readonly string[]).includes(ext))
    return 'The file must be a .pdf, .jpg, .jpeg or .png.';
  if (file.size === 0) return 'That file is empty.';
  if (file.size > MAX_PRESCRIPTION_FILE_BYTES) return 'The file must be 5 MB or smaller.';
  return null;
}
