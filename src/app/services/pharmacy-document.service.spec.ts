import { TestBed } from '@angular/core/testing';
import { PharmacyDocumentService } from './pharmacy-document.service';

describe('PharmacyDocumentService', () => {
  let service: PharmacyDocumentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PharmacyDocumentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
