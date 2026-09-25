import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyAdminManagesComponent } from './pharmacy-admin-manages.component';

describe('PharmacyAdminManagesComponent', () => {
  let component: PharmacyAdminManagesComponent;
  let fixture: ComponentFixture<PharmacyAdminManagesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyAdminManagesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyAdminManagesComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
