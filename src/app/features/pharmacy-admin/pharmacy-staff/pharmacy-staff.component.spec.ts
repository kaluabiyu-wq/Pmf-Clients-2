import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyStaffComponent } from './pharmacy-staff.component';

describe('PharmacyStaffComponent', () => {
  let component: PharmacyStaffComponent;
  let fixture: ComponentFixture<PharmacyStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyStaffComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyStaffComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
