import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { LocationService } from '../../../services/location.service';
import { UserService } from '../../../services/user.service';
import { USER_ROLES } from '../../../model/user.model';

const PATIENT_ROLE_ID = USER_ROLES.find((r) => r.name === 'Patient')!.id;

@Component({
  selector: 'app-signup-patient',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './signup-patient.componenet.html',
  styleUrl: './signup-patient.componenet.scss',
})
export class SignupPatientComponent {
  private readonly fb = inject(FormBuilder);
  private readonly users = inject(UserService);
  private readonly locationService = inject(LocationService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly locationsResource = rxResource({
    stream: () => this.locationService.getAll({ pageSize: 200 }),
  });

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    locationId: [null as number | null, Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const raw = this.form.getRawValue();

    this.users
      .create({
        fullName: raw.fullName,
        email: raw.email,
        password: raw.password,
        locationId: raw.locationId as number,
        roleId: PATIENT_ROLE_ID,
      })
      .subscribe({
        next: () => this.router.navigate(['/login'], { queryParams: { registered: 'patient' } }),
        error: (err: HttpErrorResponse) => {
          this.isSubmitting.set(false);
          this.submitError.set(
            err.status === 409
              ? 'That email is already registered.'
              : 'Sign up failed. Please try again.',
          );
        },
      });
  }
}