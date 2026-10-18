import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MedicineSearchComponent } from '../medicine-search/medicine-search.component';

@Component({
  selector: 'app-patient-dashboard',
  imports: [MedicineSearchComponent],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDashboardComponent {}