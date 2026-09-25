export type DocumentType =
  | 'License'
  | 'BusinessRegistration'
  | 'PharmacistCredential'
  | (string & {});

export type ReviewStatus = 'Pending' | 'Approved' | 'Rejected' | (string & {});


export interface PharmacyDocumentResponse {
  id: number;
  pharmacyId: number;
  documentType: DocumentType;
  fileUrl: string;
  uploadedAt: string;
  reviewedByUserId: number | null;
  reviewStatus: ReviewStatus;
  expiresAt: string | null;
}


export interface CreatePharmacyDocumentRequest {
  documentType: DocumentType;
  fileUrl: string;
  expiresAt?: string | null;
}


export interface PharmacyDocumentReviewRequest {
  reviewedByUserId: number;
  reviewStatus: ReviewStatus;
}