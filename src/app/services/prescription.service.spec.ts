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

  it('uploads a prescription file as multipart form data in the "File" field', () => {
    const file = new File(['%PDF'], 'rx.pdf', { type: 'application/pdf' });
    service.upload(7, file).subscribe();
    const req = http.expectOne(`${api}/orders/7/prescriptions/upload`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBe(true);
    expect((req.request.body as FormData).get('File')).toBeInstanceOf(File);
    expect((req.request.body as FormData).get('File')).toHaveProperty('name', 'rx.pdf');
    req.flush({});
  });

  it('downloads a stored file as a blob', () => {
    service.getFile(4).subscribe((blob) => expect(blob).toBeInstanceOf(Blob));
    const req = http.expectOne(`${api}/prescriptions/4/file`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['x'], { type: 'application/pdf' }));
  });

  it('opens an old link submission directly without calling the API', () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    service.openFile({ id: 1, fileUrl: 'https://example.com/rx.jpg' }).subscribe();
    expect(open).toHaveBeenCalledWith('https://example.com/rx.jpg', '_blank', 'noopener,noreferrer');
    http.expectNone(`${api}/prescriptions/1/file`);
    open.mockRestore();
  });

  it('closes the pre-opened tab when the file cannot be downloaded', () => {
    const tab = { close: vi.fn(), location: { href: '' } } as unknown as Window;
    const open = vi.spyOn(window, 'open').mockReturnValue(tab);
    let failed = false;
    service.openFile({ id: 2, fileUrl: 'prescriptions/abc.pdf' }).subscribe({ error: () => (failed = true) });
    http.expectOne(`${api}/prescriptions/2/file`).flush(new Blob(), { status: 404, statusText: 'Not Found' });
    expect(failed).toBe(true);
    expect(tab.close).toHaveBeenCalled();
    open.mockRestore();
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
