import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { PrescriptionService } from './prescription.service';

describe('PrescriptionService', () => {
  let service: PrescriptionService;
  let http: HttpTestingController;
  const api = environment.apiBaseUrl;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PrescriptionService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('submits a prescription link for an order', () => {
    service.submit(7, { fileUrl: 'https://example.com/rx.jpg' }).subscribe();
    const req = http.expectOne(`${api}/orders/7/prescriptions`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ fileUrl: 'https://example.com/rx.jpg' });
    req.flush({});
  });

  it('lists a pharmacy queue filtered by status and page', () => {
    service.getByPharmacy(3, { status: 'Pending', page: 2, pageSize: 10 }).subscribe();
    const req = http.expectOne((r) => r.url === `${api}/pharmacies/3/prescriptions`);
    expect(req.request.params.get('status')).toBe('Pending');
    expect(req.request.params.get('page')).toBe('2');
    expect(req.request.params.get('pageSize')).toBe('10');
    req.flush({ items: [] });
  });

  it('reviews a prescription with PATCH', () => {
    service.review(9, { verificationStatus: 'Rejected', note: 'Unreadable' }).subscribe();
    const req = http.expectOne(`${api}/prescriptions/9/review`);
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body).toEqual({ verificationStatus: 'Rejected', note: 'Unreadable' });
    req.flush({});
  });
});
