import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth-service.service';
import { LocationService } from '../../../services/location.service';
import { LocationFieldsComponent } from '../../../ui/location-fields/location-fields.componenet';
import { switchMap } from 'rxjs';

type DocumentControl = 'license' | 'businessRegistration' | 'pharmacistCredential';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

@Component({
  selector: 'app-signup-pharmacy',
  standalone: true,
 imports: [ReactiveFormsModule, RouterLink, LocationFieldsComponent],
  templateUrl: './signup-pharmacy.componenet.html',
  styleUrl: './signup-pharmacy.componenet.scss',
})
export class SignupPharmacyComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly locationService = inject(LocationService);
  private readonly router = inject(Router);

  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly fileErrors = signal<Partial<Record<DocumentControl, string>>>({});

  readonly locationGroup = this.fb.group({
  label: this.fb.nonNullable.control('', Validators.required),
  subcity: this.fb.nonNullable.control('', Validators.required),
  woreda: this.fb.nonNullable.control('', Validators.required),
  latitude: new FormControl<number | null>(null, Validators.required),
  longitude: new FormControl<number | null>(null, Validators.required),
});

  readonly form = this.fb.group({
    fullName: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(200),
    ]),
    email: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.email,
      Validators.maxLength(200),
    ]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    location: this.locationGroup,
    pharmacyName: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(200),
    ]),
    licenseNumber: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(100),
    ]),
    // Accepts 911223344, 0911223344 or +251911223344; the service sends the last 9 digits.
    phoneNumber: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.pattern(/^(\+?251|0)?\d{9}$/),
    ]),
    license: new FormControl<File | null>(null, Validators.required),
    businessRegistration: new FormControl<File | null>(null, Validators.required),
    pharmacistCredential: new FormControl<File | null>(null, Validators.required),
  });

  onFileSelected(control: DocumentControl, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    const ctrl = this.form.controls[control];

    let problem: string | undefined;
    if (file) {
      const name = file.name.toLowerCase();
      if (!ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))) {
        problem = 'Use a PDF, JPG or PNG.';
      } else if (file.size === 0) {
        problem = 'File is empty.';
      } else if (file.size > MAX_FILE_BYTES) {
        problem = 'File must be 5 MB or smaller.';
      }
    }

    this.fileErrors.update((errors) => ({ ...errors, [control]: problem }));
    ctrl.setValue(problem ? null : file);
    ctrl.markAsTouched();
  }

 onSubmit(): void {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  const v = this.form.getRawValue();
  const loc = v.location;
  this.isSubmitting.set(true);
  this.submitError.set(null);

  this.locationService
    .create({
      label: loc.label,
      subcity: loc.subcity,
      woreda: loc.woreda,
      coordinate: { latitude: loc.latitude!, longitude: loc.longitude! },
    })
    .pipe(
      switchMap((created) =>
        this.auth.registerPharmacy({
          fullName: v.fullName.trim(),
          email: v.email.trim(),
          password: v.password,
          locationId: created.id,
          pharmacyName: v.pharmacyName.trim(),
          licenseNumber: v.licenseNumber.trim(),
          phoneNumber: v.phoneNumber,
          license: v.license!,
          businessRegistration: v.businessRegistration!,
          pharmacistCredential: v.pharmacistCredential!,
        }),
      ),
    )
    .subscribe({
      // No auto-login: the pharmacy is unverified until an admin approves it.
      next: () => this.router.navigate(['/login'], { queryParams: { registered: 'pharmacy' } }),
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        const fieldErrors = err.error?.errors
          ? (Object.values(err.error.errors).flat() as string[])
          : [];
        this.submitError.set(
          fieldErrors.join(' ') ||
            err.error?.detail ||
            err.error?.title ||
            'Registration failed. Please try again.',
        );
      },
    });
}
}