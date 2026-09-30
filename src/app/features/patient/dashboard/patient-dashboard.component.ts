import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-patient-dashboard',
  imports: [FormsModule],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss',
})
export class PatientDashboardComponent {
  private readonly router = inject(Router);

  readonly searchTerm = signal('');

  onSearch(): void {
    const term = this.searchTerm().trim();
    if (!term) {
      return;
    }
    this.router.navigate(['/search'], { queryParams: { q: term } });
  }
}