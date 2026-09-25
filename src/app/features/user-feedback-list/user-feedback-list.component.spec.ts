import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserFeedbackListComponent } from './user-feedback-list.component';

describe('UserFeedbackListComponent', () => {
  let component: UserFeedbackListComponent;
  let fixture: ComponentFixture<UserFeedbackListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserFeedbackListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(UserFeedbackListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
