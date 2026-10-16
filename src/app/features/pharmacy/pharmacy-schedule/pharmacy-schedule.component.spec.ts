import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyScheduleComponent } from './pharmacy-schedule.component';

describe('PharmacyScheduleComponent', () => {
  let component: PharmacyScheduleComponent;
  let fixture: ComponentFixture<PharmacyScheduleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyScheduleComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyScheduleComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
