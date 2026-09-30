import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SignupPatientComponent } from './signup-patient.componenet';

describe('SignupPatientComponenet', () => {
  let component: SignupPatientComponent;
  let fixture: ComponentFixture<SignupPatientComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SignupPatientComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupPatientComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
