
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