import { Component, EventEmitter, Input, Output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Medicine } from '../../model/medicine.model';

@Component({
  selector: 'app-medicine-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './medicine-card.componenet.html',
  styleUrl: './medicine-card.componenet.scss',
})
export class MedicineCardComponent {
  @Input({ required: true }) medicine!: Medicine;
  @Output() favoriteToggled = new EventEmitter<Medicine>();

  onFavoriteClick(event: Event) {
    // stop the click from bubbling to the routerLink and navigating away
    event.stopPropagation();
    event.preventDefault();
    this.favoriteToggled.emit(this.medicine);
  }
}
