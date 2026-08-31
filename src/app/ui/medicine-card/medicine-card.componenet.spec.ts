import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MedicineCardComponenet } from './medicine-card.componenet';

describe('MedicineCardComponenet', () => {
  let component: MedicineCardComponenet;
  let fixture: ComponentFixture<MedicineCardComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MedicineCardComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(MedicineCardComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
