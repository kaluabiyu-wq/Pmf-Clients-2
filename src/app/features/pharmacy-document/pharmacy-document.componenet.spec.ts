import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PharmacyDocumentComponenet } from './pharmacy-document.componenet';

describe('PharmacyDocumentComponenet', () => {
  let component: PharmacyDocumentComponenet;
  let fixture: ComponentFixture<PharmacyDocumentComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PharmacyDocumentComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(PharmacyDocumentComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
