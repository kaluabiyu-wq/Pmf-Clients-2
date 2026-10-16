import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyOpeningHoursComponent } from './pharmacy-opening-hours.component';

describe('PharmacyOpeningHoursComponent', () => {
  let component: PharmacyOpeningHoursComponent;
  let fixture: ComponentFixture<PharmacyOpeningHoursComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyOpeningHoursComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyOpeningHoursComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
