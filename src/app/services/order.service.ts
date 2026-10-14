import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import {OrderItemQuantityRequest,OrderItemRequest,
  OrderListQuery,OrderPage,OrderRequest,
  OrderResponse,
} from '../model/order.model';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.apiBaseUrl;

  private get ordersUrl(): string {
    return `${this.baseUrl}/orders`;
  }

  private toParams(query: OrderListQuery): HttpParams {
    let params = new HttpParams();
    if (query.status) params = params.set('status', query.status);
    if (query.page) params = params.set('page', query.page);
    if (query.pageSize) params = params.set('pageSize', query.pageSize);
    return params;
  }

   create(request: OrderRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(this.ordersUrl, request);
  }

    getMine(query: OrderListQuery = {}): Observable<OrderPage> {
    return this.http.get<OrderPage>(this.ordersUrl, { params: this.toParams(query) });
  }

  getById(id: number): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.ordersUrl}/${id}`);
  }

   addItem(orderId: number, item: OrderItemRequest): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.ordersUrl}/${orderId}/items`, item);
  }

  updateItemQuantity(orderId: number, itemId: number, quantity: number): Observable<OrderResponse> {
    const body: OrderItemQuantityRequest = { quantity };
    return this.http.put<OrderResponse>(`${this.ordersUrl}/${orderId}/items/${itemId}`, body);
  }

   removeItem(orderId: number, itemId: number): Observable<OrderResponse> {
    return this.http.delete<OrderResponse>(`${this.ordersUrl}/${orderId}/items/${itemId}`);
  }

   cancel(id: number): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.ordersUrl}/${id}/cancel`, {});
  }

  
  getByPharmacy(pharmacyId: number, query: OrderListQuery = {}): Observable<OrderPage> {
    return this.http.get<OrderPage>(`${this.baseUrl}/pharmacies/${pharmacyId}/orders`, {
      params: this.toParams(query),
    });
  }

  
  confirm(id: number): Observable<OrderResponse> {
    return this.http.post<OrderResponse>(`${this.ordersUrl}/${id}/confirm`, {});
  }
}
