import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UnauthorizedComponenet } from './unauthorized.componenet';

describe('UnauthorizedComponenet', () => {
  let component: UnauthorizedComponenet;
  let fixture: ComponentFixture<UnauthorizedComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnauthorizedComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(UnauthorizedComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
