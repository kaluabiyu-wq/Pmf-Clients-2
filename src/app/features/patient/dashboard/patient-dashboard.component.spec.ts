import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { PatientDashboardComponent } from './patient-dashboard.component';
import { OrderResponse } from '../../../model/order.model';

function order(overrides: Partial<OrderResponse>): OrderResponse {
  return {
    id: 1, userId: 1, pharmacyId: 1, status: 'Pending', createdAt: '', updatedAt: '',
    totalPrice: 0, items: [], requiresPrescription: false, prescriptionStatus: null, ...overrides,
  };
}

describe('PatientDashboardComponent', () => {
  let component: PatientDashboardComponent;
  let fixture: ComponentFixture<PatientDashboardComponent>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDashboardComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PatientDashboardComponent);
    component = fixture.componentInstance;
    http = TestBed.inject(HttpTestingController);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('flags only pending orders that still need a prescription', () => {
    expect(component.needsPrescription(order({ requiresPrescription: true }))).toBe(true);
    expect(component.needsPrescription(order({ requiresPrescription: true, prescriptionStatus: 'Rejected' }))).toBe(true);
    expect(component.needsPrescription(order({ requiresPrescription: true, prescriptionStatus: 'Pending' }))).toBe(false);
    expect(component.needsPrescription(order({ requiresPrescription: true, prescriptionStatus: 'Approved' }))).toBe(false);
    expect(component.needsPrescription(order({ requiresPrescription: false }))).toBe(false);
    expect(component.needsPrescription(order({ status: 'Confirmed', requiresPrescription: true }))).toBe(false);
  });

  it('summarises long orders as "a, b +N more"', () => {
    const item = (genericName: string) => ({ genericName }) as OrderResponse['items'][number];
    const o = order({ items: [item('A'), item('B'), item('C'), item('D')] });
    expect(component.itemsSummary(o)).toBe('A, B +2 more');
  });

  afterEach(() => http.match(() => true));
});