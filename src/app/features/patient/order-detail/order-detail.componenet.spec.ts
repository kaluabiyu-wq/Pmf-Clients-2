import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrderDetailComponenet } from './order-detail.componenet';

describe('OrderDetailComponenet', () => {
  let component: OrderDetailComponenet;
  let fixture: ComponentFixture<OrderDetailComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrderDetailComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(OrderDetailComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
