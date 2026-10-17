import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyScopeComponent } from './pharmacy-scope.component';

describe('PharmacyScopeComponent', () => {
  let component: PharmacyScopeComponent;
  let fixture: ComponentFixture<PharmacyScopeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyScopeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyScopeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
