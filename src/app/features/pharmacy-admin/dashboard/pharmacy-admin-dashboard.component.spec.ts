import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyAdminDashboardComponent } from './pharmacy-admin-dashboard.component';

describe('PharmacyAdminDashboardComponent', () => {
  let component: PharmacyAdminDashboardComponent;
  let fixture: ComponentFixture<PharmacyAdminDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyAdminDashboardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyAdminDashboardComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
