import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicineSearchDetailComponent } from './medicine-search-detail.component';

describe('MedicineSearchDetailComponent', () => {
  let component: MedicineSearchDetailComponent;
  let fixture: ComponentFixture<MedicineSearchDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineSearchDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineSearchDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
