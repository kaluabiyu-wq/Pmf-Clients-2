export interface AccountProfile {
  id: number;
  fullName: string;
  email: string;
  role: string;
  createdAt: string;
  locationId: number;
  locationLabel: string;
  subcity: string;
  woreda: string;
  latitude: number;
  longitude: number;
  orderCount: number;
  openOrderCount: number;
  favoriteCount: number;
  reviewCount: number;
}

export interface UpdateAccountRequest {
  fullName: string;
  email: string;
  locationId?: number;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}