import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyListCardComponenet } from './pharmacy-list-card.componenet';

describe('PharmacyListCardComponenet', () => {
  let component: PharmacyListCardComponenet;
  let fixture: ComponentFixture<PharmacyListCardComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyListCardComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyListCardComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
