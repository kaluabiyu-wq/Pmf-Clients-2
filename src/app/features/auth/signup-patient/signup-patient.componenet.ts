import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { switchMap } from 'rxjs';
import { LocationService } from '../../../services/location.service';
import { UserService } from '../../../services/user.service';
import { LocationFieldsComponent } from '../../../ui/location-fields/location-fields.componenet';

@Component({
  selector: 'app-signup-patient',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, LocationFieldsComponent],
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

  readonly locationGroup = this.fb.group({
    label: this.fb.nonNullable.control('', Validators.required),
    subcity: this.fb.nonNullable.control('', Validators.required),
    woreda: this.fb.nonNullable.control('', Validators.required),
    latitude: new FormControl<number | null>(null, Validators.required),
    longitude: new FormControl<number | null>(null, Validators.required),
  });

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    location: this.locationGroup,
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const raw = this.form.getRawValue();
    const loc = raw.location;

    this.locationService
      .create({
        label: loc.label,
        subcity: loc.subcity,
        woreda: loc.woreda,
        coordinate: { latitude: loc.latitude!, longitude: loc.longitude! },
      })
      .pipe(
        switchMap((created) =>
          // The API forces the Patient role; the browser can no longer ask for another one.
          this.users.registerPatient({
            fullName: raw.fullName,
            email: raw.email,
            password: raw.password,
            locationId: created.id,
          }),
        ),
      )
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