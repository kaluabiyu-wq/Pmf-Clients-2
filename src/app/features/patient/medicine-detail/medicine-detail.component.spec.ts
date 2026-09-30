import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicineDetailComponent } from './medicine-detail.component';

describe('MedicineDetailComponent', () => {
  let component: MedicineDetailComponent;
  let fixture: ComponentFixture<MedicineDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
