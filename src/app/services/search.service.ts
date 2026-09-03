import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { SearchRequest, SearchResponse, SearchResultItem } from '../model/search.model';
import { environment } from '../../environments/environment';


@Injectable({ providedIn: 'root' })
export class SearchService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiBaseUrl}/user`;

  readonly isSearching = signal(false);
  readonly searchError = signal<string | null>(null);
  readonly lastResult = signal<SearchResponse | null>(null);

  readonly selectedResult = signal<SearchResultItem | null>(null);

  search(userId: number, request: SearchRequest): Observable<SearchResponse> {
    this.isSearching.set(true);
    this.searchError.set(null);

    return this.http
      .post<SearchResponse>(`${this.baseUrl}/${userId}/search`, request)
      .pipe(
        tap((response) => {
          this.lastResult.set(response);
          this.isSearching.set(false);
        }),
        catchError((err: HttpErrorResponse) => {
          this.isSearching.set(false);
          this.searchError.set(this.extractErrorMessage(err));
          return throwError(() => err);
        }),
      );
  }

  getById(userId: number, id: number): Observable<SearchResponse> {
    return this.http.get<SearchResponse>(`${this.baseUrl}/${userId}/search/${id}`);
  }

   selectResult(item: SearchResultItem): void {
    this.selectedResult.set(item);
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    if (err.status === 0) {
      return 'Could not reach the server. Check that the API is running and that CORS allows this origin.';
    }
    if (err.status === 404 && this.isLocationNotFound(err)) {
      return 'That location could not be found. Try picking a location again.';
    }
    if (err.status === 404) {
      return 'Search endpoint not found. Check the API base URL configuration.';
    }
    if (err.status === 400 && err.error?.errors) {
      return 'That search could not be validated. Check the medicine name and location.';
    }
    return 'Something went wrong while searching. Please try again.';
  }
 
 
  private isLocationNotFound(err: HttpErrorResponse): boolean {
    return typeof err.error === 'object' && err.error !== null;
  }
}