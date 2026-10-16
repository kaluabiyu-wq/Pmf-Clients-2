
export interface PharmacyScheduleDay {
  id: number;
  pharmacyId: number;
  dayOfWeek: number;
  openTime: string;
  closedTime: string;
  isClosed: boolean;
}


export interface PharmacyScheduleRequest {
  dayOfWeek: number;
  openTime: string;
  closedTime: string;
  isClosed: boolean;
}