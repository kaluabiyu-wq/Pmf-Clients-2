import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicineSearchComponent } from './medicine-search.component';

describe('MedicineSearchComponent', () => {
  let component: MedicineSearchComponent;
  let fixture: ComponentFixture<MedicineSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineSearchComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineSearchComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
