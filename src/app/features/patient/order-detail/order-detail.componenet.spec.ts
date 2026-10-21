import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { OrderResponse } from '../../../model/order.model';
import { OrderDetailComponent } from './order-detail.componenet';

const order = (over: Partial<OrderResponse> = {}): OrderResponse => ({
  id: 7, userId: 1, pharmacyId: 1, status: 'Pending',
  createdAt: '2026-10-01T10:00:00Z', updatedAt: '2026-10-01T10:00:00Z', totalPrice: 200,
  items: [
    { id: 1, orderId: 7, inventoryId: 1, medicineId: 1, genericName: 'Amoxicillin',pharmacyName:'', brandName: '', quantity: 1, unitPrice: 100, lineTotal: 100 },
    { id: 2, orderId: 7, inventoryId: 2, medicineId: 2, genericName: 'Paracetamol',pharmacyName:'', brandName: '', quantity: 1, unitPrice: 100, lineTotal: 100 },
  ],
  requiresPrescription: true, prescriptionStatus: null, ...over,
});

describe('OrderDetailComponent', () => {
  let fixture: ComponentFixture<OrderDetailComponent>;
  let component: OrderDetailComponent;
  let http: HttpTestingController;
  const api = environment.apiBaseUrl;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetailComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(OrderDetailComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.componentRef.setInput('id', '7');
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  async function load(o: OrderResponse) {
    http.expectOne(`${api}/orders/7`).flush(o);
    await fixture.whenStable();
    fixture.detectChanges();
    // The embedded prescription panel loads its own history.
    http.match(`${api}/orders/7/prescriptions`).forEach((r) => r.flush([]));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('asks for a prescription upload while none is approved', async () => {
    await load(order());
    expect(component.needsPrescription()).toBe(true);
    expect(component.quantitiesLocked()).toBe(false);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Upload a photo or PDF');
    expect(el.querySelector('app-prescription-panel input[type="file"]')).toBeTruthy();
  });

  it('locks quantities once the prescription is approved, to avoid the API\'s 409', async () => {
    await load(order({ prescriptionStatus: 'Approved' }));
    expect(component.needsPrescription()).toBe(false);
    expect(component.quantitiesLocked()).toBe(true);
    const qty = fixture.nativeElement.querySelectorAll('input.qty') as NodeListOf<HTMLInputElement>;
    expect(qty.length).toBe(2);
    qty.forEach((i) => expect(i.disabled).toBe(true));
    expect(fixture.nativeElement.textContent).toContain('Quantities are locked');
  });

  it('does not nag about prescriptions on a cancelled order', async () => {
    await load(order({ status: 'Cancelled', prescriptionStatus: 'Rejected' }));
    expect(component.needsPrescription()).toBe(false);
    expect(fixture.nativeElement.querySelector('.warn-banner')).toBeNull();
  });
});
