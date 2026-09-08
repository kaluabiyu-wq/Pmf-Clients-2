import { Component, effect, inject, viewChild } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { MedicineCardComponent } from '../../ui/medicine-card/medicine-card.componenet';
import { Medicine } from '../../model/medicine.model';
import { MedicineService } from '../../services/medicine.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';

@Component({
  selector: 'app-medicine',
  standalone: true,
  imports: [MedicineCardComponent, MatPaginatorModule, MatSortModule],
  templateUrl: './medicine.component.html',
  styleUrl: './medicine.component.scss',
})
export class MedicineComponent {
  private api = inject(MedicineService);

  medicinesResource = rxResource({
    stream: () => this.api.getAll(),
  });

  dataSource = new MatTableDataSource<Medicine>([]);

  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

   pagedMedicines = toSignal(this.dataSource.connect(), { initialValue: [] as Medicine[] });

  constructor() {
      effect(() => {
      const data = this.medicinesResource.value();
      if (data) {
        this.dataSource.data = data;
      }
    });

       effect(() => {
      this.dataSource.paginator = this.paginator();
      this.dataSource.sort = this.sort();
    });
  }
 
}
