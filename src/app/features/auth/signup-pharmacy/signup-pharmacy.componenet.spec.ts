import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupPharmacyComponent } from './signup-pharmacy.componenet';

describe('SignupPharmacyComponenet', () => {
  let component: SignupPharmacyComponent;
  let fixture: ComponentFixture<SignupPharmacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupPharmacyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPharmacyComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
