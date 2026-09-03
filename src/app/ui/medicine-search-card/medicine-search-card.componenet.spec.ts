import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicineSearchCardComponent } from './medicine-search-card.componenet';

describe('MedicineSearchCardComponenet', () => {
  let component: MedicineSearchCardComponent;
  let fixture: ComponentFixture<MedicineSearchCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineSearchCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineSearchCardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
