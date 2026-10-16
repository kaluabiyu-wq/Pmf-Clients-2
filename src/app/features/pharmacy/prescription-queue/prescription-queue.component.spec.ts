import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PrescriptionQueueComponent } from './prescription-queue.component';

describe('PrescriptionQueueComponent', () => {
  let component: PrescriptionQueueComponent;
  let fixture: ComponentFixture<PrescriptionQueueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrescriptionQueueComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PrescriptionQueueComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
