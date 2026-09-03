/** Mirrors PmfApi.Domain.Entities.Coordinate — a plain lat/lng pair, not a full geo type. */
export interface Coordinate {
  latitude: number;
  longitude: number;
}
export interface Location {
  id: number;
  label: string;
  subcity: string;
  woreda: string;
  coordinate: Coordinate;
}

export interface CreateLocationRequest {
  label: string;
  subcity: string;
  woreda: string;
  coordinate: Coordinate;
}

/**
 * Mirrors PmfApi.Application.Dtos.PagedRequest — the query params
 * LocationController's GET /api/location action accepts.
 */
export interface PagedLocationQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  orderBy?: 'Label' | 'Subcity' | 'Coordinate' | 'Woreda';
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