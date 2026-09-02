import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InventoryCardComponenet } from './inventory-card.componenet';

describe('InventoryCardComponenet', () => {
  let component: InventoryCardComponenet;
  let fixture: ComponentFixture<InventoryCardComponenet>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InventoryCardComponenet],
    }).compileComponents();

    fixture = TestBed.createComponent(InventoryCardComponenet);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
