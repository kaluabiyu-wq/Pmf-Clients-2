export interface PharmacyStaffRequest {
  userId: number;
  position: string;
  isActive?: boolean;
}

export interface PharmacyStaffResponse {
  id: number;
  userId: number;
  pharmacyId: number;
  position: string;
  isActive: boolean;
  assignedAt: string;
}

export const PHARMACY_STAFF_POSITIONS: readonly string[] = [
  'Pharmacist',
  'Manager',
  'Technician',
];