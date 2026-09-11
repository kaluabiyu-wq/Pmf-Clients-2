import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  PagedReviewQuery,
  PagedResponse,
  ReviewRequest,
  ReviewResponse,
} from '../model/review.model';

@Injectable({ providedIn: 'root' })
export class ReviewService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiBaseUrl;

  private reviewsUrl(pharmacyId: number): string {
    return `${this.baseUrl}/pharmacies/${pharmacyId}/reviews`;
  }

  getByPharmacy(
    pharmacyId: number,
    query: PagedReviewQuery = {}
  ): Observable<PagedResponse<ReviewResponse>> {
    let params = new HttpParams();

    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    if (query.search) params = params.set('search', query.search);
    if (query.orderBy) params = params.set('orderBy', query.orderBy);
    if (query.descending !== undefined) {
      params = params.set('descending', query.descending);
    }

    return this.http.get<PagedResponse<ReviewResponse>>(this.reviewsUrl(pharmacyId), {
      params,
    });
  }

  getById(pharmacyId: number, id: number): Observable<ReviewResponse> {
    return this.http.get<ReviewResponse>(`${this.reviewsUrl(pharmacyId)}/${id}`);
  }

   getAverageRating(pharmacyId: number): Observable<number | null> {
    return this.http.get<number | null>(`${this.reviewsUrl(pharmacyId)}/average-rating`);
  }

  create(pharmacyId: number, request: ReviewRequest): Observable<ReviewResponse> {
    return this.http.post<ReviewResponse>(this.reviewsUrl(pharmacyId), request);
  }
}