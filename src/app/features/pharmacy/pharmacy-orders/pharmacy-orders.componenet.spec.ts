import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyOrdersComponenet } from './pharmacy-orders.componenet';

describe('PharmacyOrdersComponenet', () => {
  let component: PharmacyOrdersComponenet;
  let fixture: ComponentFixture<PharmacyOrdersComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyOrdersComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyOrdersComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
