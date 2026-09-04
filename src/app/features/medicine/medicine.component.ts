import { Component, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MedicineCardComponent } from '../../ui/medicine-card/medicine-card.componenet';
import { Medicine } from '../../model/medicine.model';
import { MedicineService } from '../../services/medicine.service';

@Component({
  selector: 'app-medicine',
  standalone: true,
  imports: [MedicineCardComponent],
  templateUrl: './medicine.component.html',
  styleUrl: './medicine.component.scss',
})
export class MedicineComponent {
  private api = inject(MedicineService);

  medicinesResource = rxResource({
    stream: () => this.api.getAll(),
  });

 
}
