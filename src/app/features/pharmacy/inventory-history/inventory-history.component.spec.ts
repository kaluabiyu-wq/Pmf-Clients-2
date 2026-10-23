import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryHistoryComponent } from './inventory-history.component';

describe('InventoryHistoryComponent', () => {
  let component: InventoryHistoryComponent;
  let fixture: ComponentFixture<InventoryHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryHistoryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryHistoryComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
