import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PasswordRecoveryComponent } from './password-recovery.component';

describe('PasswordRecoveryComponent', () => {
  let component: PasswordRecoveryComponent;
  let fixture: ComponentFixture<PasswordRecoveryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PasswordRecoveryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PasswordRecoveryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
