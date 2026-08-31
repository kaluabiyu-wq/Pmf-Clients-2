import { Component, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { MedicineService } from '../../services/medicine.service';

@Component({
  selector: 'app-medicine-detail',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './medicine-detail.component.html',
  styleUrl: './medicine-detail.component.scss',
})
export class MedicineDetailComponent {
  private api = inject(MedicineService);

  id = input.required<string>();

  medicineResource = rxResource({
    params: () => ({ id: this.id() }),
    stream: ({ params }) => this.api.getById(Number(params.id)),
  });

  onFavoriteClick() {
    console.log('favorite toggled:', this.id());
  }
}
