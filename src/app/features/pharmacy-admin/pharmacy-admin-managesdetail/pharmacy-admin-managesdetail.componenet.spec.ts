import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyAdminManagesdetailComponenet } from './pharmacy-admin-managesdetail.componenet';

describe('PharmacyAdminManagesdetailComponenet', () => {
  let component: PharmacyAdminManagesdetailComponenet;
  let fixture: ComponentFixture<PharmacyAdminManagesdetailComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyAdminManagesdetailComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyAdminManagesdetailComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
