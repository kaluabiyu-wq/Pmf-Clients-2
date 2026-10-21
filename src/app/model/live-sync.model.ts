
export const LIVE_EVENTS = {
  inventoryStatusChanged: 'ReceiveInventoryStatusChanged',
  orderCreated: 'ReceiveOrderCreated',
  orderStatusChanged: 'ReceiveOrderStatusChanged',
  prescriptionVerified: 'ReceivePrescriptionVerified',
} as const;

/** Client → server hub methods (public methods on PmfHub). */
export const HUB_METHODS = {
  watchMedicine: 'WatchMedicine',
  unwatchMedicine: 'UnwatchMedicine',
} as const;

export interface InventoryStatusChangedMessage {
  inventoryId: number;
  pharmacyId: number;
  medicineId: number;
  status: string;
  price: number;
  updatedAtUtc: string;
}

export interface OrderCreatedMessage {
  orderId: number;
  pharmacyId: number;
  patientUserId: number;
  createdAtUtc: string;
}

export interface OrderStatusChangedMessage {
  orderId: number;
  pharmacyId: number;
  patientUserId: number;
  status: string;
}

export interface PrescriptionVerifiedMessage {
  prescriptionId: number;
  orderId: number;
  pharmacyId: number;
  patientUserId: number;
  approved: boolean;
  reason: string | null;
}

export type LiveSyncState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';