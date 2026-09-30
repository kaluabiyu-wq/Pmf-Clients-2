import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFeedbackComponent } from './user-feedback.component';

describe('UserFeedbackComponent', () => {
  let component: UserFeedbackComponent;
  let fixture: ComponentFixture<UserFeedbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFeedbackComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFeedbackComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
