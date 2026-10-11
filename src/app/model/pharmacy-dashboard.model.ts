export interface PharmacyDashboard {
  pharmacyId: number;
  name: string;
  verificationStatus: 'approved' | 'pending' | 'rejected';
  reliabilityScore: number;
  freshnessThreshold: number;
  itemsListed: number;
  outOfStockCount: number;
  feedbackCount: number;
  unavailableReports: number;
  lastInventoryUpdateAt: string;
  averageRating: number | null;
  reviewCount: number;
  favouritCount: number;

}