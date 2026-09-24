import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  Coordinate,
  CreateLocationRequest,
  Location,
  PagedLocationQuery,
  PagedResponse,
} from '../model/location.model';


@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/location`;

 
  getAll(query: PagedLocationQuery = {}): Observable<PagedResponse<Location>> {
    const params: Record<string, string> = {};
    if (query.page !== undefined) params['page'] = query.page.toString();
    if (query.pageSize !== undefined) params['pageSize'] = query.pageSize.toString();
    if (query.search) params['search'] = query.search;
    if (query.orderBy) params['orderBy'] = query.orderBy;
    if (query.descending !== undefined) params['descending'] = query.descending.toString();

    return this.http.get<PagedResponse<Location>>(this.baseUrl, { params });
  }

  
  getByCoordinate(id: number, coordinate: Coordinate): Observable<Location> {
    return this.http.get<Location>(`${this.baseUrl}/${id}`, {
      params: {
        latitude: coordinate.latitude.toString(),
        longitude: coordinate.longitude.toString(),
      },
    });
  }
  create(request: CreateLocationRequest): Observable<Location> {
    return this.http.post<Location>(this.baseUrl, request);
  }
}