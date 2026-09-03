
export interface SearchRequest {
  medicineSearch: string;
  locationId: number;
}


export interface SearchResultItem {
  pharmacyId: number;
  pharmacyName: string;
  medicineId: number;
  genericName: string;
  brandName: string | null;
  status: string;
  price: number;
  distanceKm: number;
  locationLabel: string;
  lastUpdatedAt: string; 
}


export interface SearchResponse {
  id: number;
  userId: number;
  medicineSearch: string;
  locationId: number;
  resultCount: number;
  searchedAt: string; 
  results: SearchResultItem[];
}