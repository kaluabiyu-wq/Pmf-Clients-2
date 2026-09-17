import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyAdminCardComponenet } from './pharmacy-admin-card.componenet';

describe('PharmacyAdminCardComponenet', () => {
  let component: PharmacyAdminCardComponenet;
  let fixture: ComponentFixture<PharmacyAdminCardComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyAdminCardComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyAdminCardComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
