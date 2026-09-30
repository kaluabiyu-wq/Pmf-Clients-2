import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth-service.service';
import { LocationService } from '../../../services/location.service';

type DocumentControl = 'license' | 'businessRegistration' | 'pharmacistCredential';

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

@Component({
  selector: 'app-signup-pharmacy',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
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

  readonly locationsResource = rxResource({
    stream: () => this.locationService.getAll({ pageSize: 200 }),
  });

  readonly form = this.fb.group({
    fullName: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100),
    ]),
    email: this.fb.nonNullable.control('', [Validators.required, Validators.email]),
    password: this.fb.nonNullable.control('', [Validators.required, Validators.minLength(8)]),
    locationId: new FormControl<number | null>(null, Validators.required),
    pharmacyName: this.fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(150),
    ]),
    address: this.fb.nonNullable.control('', Validators.required),
    phoneNumber: this.fb.nonNullable.control('', Validators.required),
    license: new FormControl<File | null>(null, Validators.required),
    businessRegistration: new FormControl<File | null>(null, Validators.required),
    pharmacistCredential: new FormControl<File | null>(null, Validators.required),
  });

  onFileSelected(control: DocumentControl, event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0] ?? null;
    const ctrl = this.form.controls[control];

    let problem: string | undefined;
    if (file && !ALLOWED_TYPES.includes(file.type)) problem = 'Use a PDF, JPG or PNG.';
    else if (file && file.size > MAX_FILE_BYTES) problem = 'File must be 5 MB or smaller.';

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
    this.isSubmitting.set(true);
    this.submitError.set(null);

    this.auth
      .registerPharmacy({
        fullName: v.fullName,
        email: v.email,
        password: v.password,
        locationId: v.locationId!,
        pharmacyName: v.pharmacyName,
        address: v.address,
        phoneNumber: v.phoneNumber,
        license: v.license!,
        businessRegistration: v.businessRegistration!,
        pharmacistCredential: v.pharmacistCredential!,
      })
      .subscribe({
        // No auto-login: the pharmacy is unverified until an admin approves it.
        next: () => this.router.navigate(['/login'], { queryParams: { registered: 'pharmacy' } }),
        error: (err: HttpErrorResponse) => {
          this.isSubmitting.set(false);
          this.submitError.set(
            err.status === 409
              ? 'That email is already registered.'
              : 'Registration failed. Nothing was created, so you can try again.',
          );
        },
      });
  }
}