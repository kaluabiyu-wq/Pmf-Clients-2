import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrescriptionPanelComponent } from './prescription-panel.componenet';

describe('PrescriptionPanelComponenet', () => {
  let component: PrescriptionPanelComponent;
  let fixture: ComponentFixture<PrescriptionPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionPanelComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PrescriptionPanelComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
