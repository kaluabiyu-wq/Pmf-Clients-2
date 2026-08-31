export interface Pharmacy {
  id: number;
  name: string;
  licenseNumber: string;
   phoneNumber: string;
  email?: string;
  isVerified: boolean;
  reliabilityScore: number;
  isActive: boolean;
  freshnessThresholdHours: number;
  lastInventoryUpdateAt: string;
  locationId: number;
}
