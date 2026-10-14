import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OrdersComponenet } from './orders.componenet';

describe('OrdersComponenet', () => {
  let component: OrdersComponenet;
  let fixture: ComponentFixture<OrdersComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrdersComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(OrdersComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
