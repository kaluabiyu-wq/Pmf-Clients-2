import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlertComponenet } from './alert.componenet';

describe('AlertComponenet', () => {
  let component: AlertComponenet;
  let fixture: ComponentFixture<AlertComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(AlertComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
