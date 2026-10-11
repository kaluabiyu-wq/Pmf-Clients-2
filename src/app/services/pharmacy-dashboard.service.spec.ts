import { TestBed } from '@angular/core/testing';
import { PharmacyDashboardService } from './pharmacy-dashboard.service';

describe('PharmacyDashboardService', () => {
  let service: PharmacyDashboardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PharmacyDashboardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
