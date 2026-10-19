import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyPharmacyComponent } from './my-pharmacy.component';

describe('MyPharmacyComponent', () => {
  let component: MyPharmacyComponent;
  let fixture: ComponentFixture<MyPharmacyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyPharmacyComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MyPharmacyComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
