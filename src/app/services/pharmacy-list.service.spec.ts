import { TestBed } from '@angular/core/testing';
import { PharmacyListService } from './pharmacy-list.service';

describe('PharmacyListService', () => {
  let service: PharmacyListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PharmacyListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
