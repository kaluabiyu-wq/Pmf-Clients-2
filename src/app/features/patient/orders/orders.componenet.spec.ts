import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { OrderResponse } from '../../../model/order.model';
import { OrdersComponenet } from './orders.componenet';

const order = (over: Partial<OrderResponse> = {}): OrderResponse => ({
  id: 1, userId: 1, pharmacyId: 1, status: 'Pending',
  createdAt: '2026-10-01T10:00:00Z', updatedAt: '2026-10-01T10:00:00Z', totalPrice: 100,
  items: [
    { id: 1, orderId: 1, inventoryId: 1, medicineId: 1, genericName: 'Amoxicillin', brandName: '', quantity: 1, unitPrice: 100, lineTotal: 100 },
  ],
  requiresPrescription: true, prescriptionStatus: null, ...over,
});

const page = (items: OrderResponse[]) => ({
  items, totalCount: items.length, page: 1, pageSize: 10, totalPages: 1, hasPrevious: false, hasNext: false,
});

describe('OrdersComponenet', () => {
  let component: OrdersComponenet;
  let fixture: ComponentFixture<OrdersComponenet>;
  let http: HttpTestingController;
  const url = `${environment.apiBaseUrl}/orders`;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersComponenet],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(OrdersComponenet);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => http.verify());

  async function load(items: OrderResponse[]) {
    http.expectOne((r) => r.url === url).flush(page(items));
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('loads the signed-in patient\'s orders, all statuses, page 1', async () => {
    const req = http.expectOne((r) => r.url === url);
    expect(req.request.params.has('status')).toBe(false);
    expect(req.request.params.get('page')).toBe('1');
    req.flush(page([order()]));
    await fixture.whenStable();
    fixture.detectChanges();
    expect(component.rows().length).toBe(1);
  });

  it('prompts for a prescription on a pending order that has none', async () => {
    await load([order()]);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Prescription required');
    expect(el.querySelector('a.btn')?.textContent).toContain('Add prescription');
  });

  it('describes each prescription state', () => {
    expect(component.prescriptionNote(order({ prescriptionStatus: 'Pending' }))).toMatch(/waiting/);
    expect(component.prescriptionNote(order({ prescriptionStatus: 'Rejected' }))).toMatch(/upload a new one/);
    expect(component.prescriptionNote(order({ prescriptionStatus: 'Approved' }))).toMatch(/approved/);
    expect(component.prescriptionNote(order({ requiresPrescription: false }))).toBeNull();
    expect(component.needsPrescription(order({ prescriptionStatus: 'Approved' }))).toBe(false);
    expect(component.needsPrescription(order({ status: 'Cancelled' }))).toBe(false);
    http.expectOne((r) => r.url === url).flush(page([]));
  });

  it('summarises long item lists', () => {
    const item = order().items[0];
    const o = order({ items: ['A', 'B', 'C', 'D'].map((n, i) => ({ ...item, id: i, genericName: n })) });
    expect(component.itemsSummary(o)).toBe('A, B +2 more');
    http.expectOne((r) => r.url === url).flush(page([]));
  });

  it('refetches with the status filter and resets to page 1', async () => {
    http.expectOne((r) => r.url === url).flush(page([]));
    await fixture.whenStable();
    component.page.set(3);
    component.setStatus('Confirmed');
    fixture.detectChanges();
    const req = http.expectOne((r) => r.url === url);
    expect(req.request.params.get('status')).toBe('Confirmed');
    expect(req.request.params.get('page')).toBe('1');
    req.flush(page([]));
  });
});
