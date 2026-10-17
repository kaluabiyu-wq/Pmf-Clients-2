import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryApprovalsComponent } from './inventory-approvals.component';

describe('InventoryApprovalsComponent', () => {
  let component: InventoryApprovalsComponent;
  let fixture: ComponentFixture<InventoryApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryApprovalsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryApprovalsComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
