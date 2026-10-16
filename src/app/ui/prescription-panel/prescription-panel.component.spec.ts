import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { environment } from '../../../environments/environment';
import { OrderResponse } from '../../model/order.model';
import { PrescriptionPanelComponent } from './prescription-panel.component';

describe('PrescriptionPanelComponenet', () => {
  let component: PrescriptionPanelComponent;
  let fixture: ComponentFixture<PrescriptionPanelComponent>;
  let http: HttpTestingController;
  const api = environment.apiBaseUrl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionPanelComponent],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(PrescriptionPanelComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('order', {
      id: 5,
      status: 'Pending',
      requiresPrescription: true,
      prescriptionStatus: null,
    } as OrderResponse);
    fixture.detectChanges();
    http.expectOne(`${api}/orders/5/prescriptions`).flush([]);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('shows a file picker instead of a link box', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('input[type="file"]')).toBeTruthy();
    expect(el.querySelector('input[type="url"]')).toBeNull();
  });

  it('refuses a file type the API would reject and does not call it', () => {
    component.file.set(new File(['x'], 'rx.gif'));
    component.onSubmit(new Event('submit'));
    expect(component.fileError()).toMatch(/\.pdf/);
    http.expectNone(`${api}/orders/5/prescriptions/upload`);
  });

  it('uploads a valid file to the upload endpoint', () => {
    component.file.set(new File(['%PDF'], 'rx.pdf', { type: 'application/pdf' }));
    component.onSubmit(new Event('submit'));
    const req = http.expectOne(`${api}/orders/5/prescriptions/upload`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1, orderId: 5, fileUrl: 'prescriptions/a.pdf', verificationStatus: 'Pending' });
    http.expectOne(`${api}/orders/5/prescriptions`).flush([]);
    expect(component.file()).toBeNull();
  });
});
