import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyListDetailComponent } from './pharmacy-list-detail.component';

describe('PharmacyListDetailComponent', () => {
  let component: PharmacyListDetailComponent;
  let fixture: ComponentFixture<PharmacyListDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyListDetailComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyListDetailComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
