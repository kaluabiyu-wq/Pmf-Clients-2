import { PagedResponse } from './inventory.model';

export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled';
export type VerificationStatus = 'Pending' | 'Approved' | 'Rejected' | (string & {});

/** POST /orders/{orderId}/items  and each line of POST /orders */
export interface OrderItemRequest {
  inventoryId: number;
  quantity: number; // 1..100
}

/** POST /orders — the patient comes from the token, the pharmacy from the items. */
export interface OrderRequest {
  items: OrderItemRequest[]; // 1..50, all from the same pharmacy
}

/** PUT /orders/{orderId}/items/{itemId} */
export interface OrderItemQuantityRequest {
  quantity: number; // 1..100
}

export interface OrderItemResponse {
  id: number;
  orderId: number;
  inventoryId: number;
  medicineId: number;
  genericName: string;
  brandName: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderResponse {
  id: number;
  userId: number;
  pharmacyId: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  totalPrice: number;
  items: OrderItemResponse[];
  requiresPrescription: boolean;
  prescriptionStatus: VerificationStatus | null;
}

/** Query string for GET /orders and GET /pharmacies/{id}/orders */
export interface OrderListQuery {
  status?: OrderStatus;
  page?: number;
  pageSize?: number;
}

export type OrderPage = PagedResponse<OrderResponse>;
