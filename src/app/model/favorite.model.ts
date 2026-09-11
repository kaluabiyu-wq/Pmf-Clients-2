
export interface FavoriteRequest {
  pharmacyId: number;
}


export interface FavoriteResponse {
  id: number;
  userId: number;
  pharmacyId: number;
  createdAt: string;
}