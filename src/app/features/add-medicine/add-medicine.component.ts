import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MedicineService } from '../../services/medicine.service';

@Component({
  selector: 'app-add-medicine',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './add-medicine.component.html',
  styleUrl: './add-medicine.component.scss',
})
export class AddMedicineComponent {
  private fb = inject(FormBuilder);
  private api = inject(MedicineService);
  private router = inject(Router);

  isSubmitting = signal(false);
  submitError = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    genericName: ['', Validators.required],
    brandName: [''],
    category: ['', Validators.required],
    dosageForm: ['Tablet', Validators.required],
    strength: ['', Validators.required],
    price: [null as number | null, [Validators.required, Validators.min(0)]],
    quantityEstimate: [null as number | null],
    requiresPrescription: [false],
    notes: [''],
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.api.create(this.form.getRawValue()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.router.navigate(['/medicine']);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.submitError.set('Could not add medicine. Make sure your .NET API is running.');
        console.error(err);
      },
    });
  }

  onCancel() {
    this.router.navigate(['/medicine']);
  }
}
