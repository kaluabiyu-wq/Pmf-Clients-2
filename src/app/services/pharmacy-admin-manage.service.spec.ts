import { TestBed } from '@angular/core/testing';
import { PharmacyAdminManageService } from './pharmacy-admin-manage.service';

describe('PharmacyAdminManageService', () => {
  let service: PharmacyAdminManageService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PharmacyAdminManageService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
