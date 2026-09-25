import { TestBed } from '@angular/core/testing';
import { PharmacyStaffService } from './pharmacy-staff.service';

describe('PharmacyStaffService', () => {
  let service: PharmacyStaffService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PharmacyStaffService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
