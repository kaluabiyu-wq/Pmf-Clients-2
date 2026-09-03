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

/**
 * Maps 1:1 onto PmfApi.Api.Controllers.LocationController, mounted at
 * [Route("api/location")]. Like MedicineController, that "api/" segment is
 * baked into the C# route attribute, and environment.apiBaseUrl already ends
 * in '/api' — so this appends only '/location', never a second 'api/'.
 */
@Injectable({ providedIn: 'root' })
export class LocationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/location`;

  /**
   * GET /api/location — paginated list, the right call for populating a
   * "choose your location" picker (e.g. the currently-unwired "Change"
   * button on the search page).
   */
  getAll(query: PagedLocationQuery = {}): Observable<PagedResponse<Location>> {
    const params: Record<string, string> = {};
    if (query.page !== undefined) params['page'] = query.page.toString();
    if (query.pageSize !== undefined) params['pageSize'] = query.pageSize.toString();
    if (query.search) params['search'] = query.search;
    if (query.orderBy) params['orderBy'] = query.orderBy;
    if (query.descending !== undefined) params['descending'] = query.descending.toString();

    return this.http.get<PagedResponse<Location>>(this.baseUrl, { params });
  }

  /**
   * GET /api/location/{id} — despite the name, this does NOT fetch a
   * location by id alone. LocationController.GetByCoordinate binds a
   * Coordinate from the query string (ASP.NET's default complex-object
   * binder matches Latitude/Longitude case-insensitively) and
   * LocationService.GetByCoordinateAsync (API side) filters on
   * `l.Id == id && l.Coordinate.Latitude == coordinate.Latitude &&
   * l.Coordinate.Longitude == coordinate.Longitude` — an exact decimal
   * match on both axes. It behaves as a "verify this id still points at
   * this coordinate" check, not a general get-by-id lookup, and will 404
   * if the coordinate you pass doesn't match exactly. Prefer getAll() for
   * anything that isn't specifically re-validating a known id+coordinate
   * pair.
   */
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