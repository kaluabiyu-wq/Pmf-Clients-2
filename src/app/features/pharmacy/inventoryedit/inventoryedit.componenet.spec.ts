import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryeditComponenet } from './inventoryedit.componenet';

describe('InventoryeditComponenet', () => {
  let component: InventoryeditComponenet;
  let fixture: ComponentFixture<InventoryeditComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryeditComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryeditComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
