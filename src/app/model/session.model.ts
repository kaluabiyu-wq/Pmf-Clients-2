export interface LoginResponse {
  token: string;
  expiresAt: string; 
  userId: number;
  fullName: string;
  role: string;
}