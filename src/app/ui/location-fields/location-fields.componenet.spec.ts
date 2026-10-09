import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LocationFieldsComponenet } from './location-fields.componenet';

describe('LocationFieldsComponenet', () => {
  let component: LocationFieldsComponenet;
  let fixture: ComponentFixture<LocationFieldsComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationFieldsComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(LocationFieldsComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
