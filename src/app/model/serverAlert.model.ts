export type ServerAlertEventType =
  | 'DocumentApproved'
  | 'DocumentRejected'
  | 'OrderPlaced'
  | 'OrderConfirmed'
  | 'OrderCancelled'
  | 'PrescriptionSubmitted'
  | 'PrescriptionApproved'
  | 'PrescriptionRejected'
  | (string & {});


export interface ServerAlert {
  id: number;
  eventType: ServerAlertEventType;
  referenceTable: string;
  referenceId: number;
  message: string;
  isRead: boolean;
  createdAt: string;
}