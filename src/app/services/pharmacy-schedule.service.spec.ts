import { TestBed } from '@angular/core/testing';
import { PharmacyScheduleService } from './pharmacy-schedule.service';

describe('PharmacyScheduleService', () => {
  let service: PharmacyScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PharmacyScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
