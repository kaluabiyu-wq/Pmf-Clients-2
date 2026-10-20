import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { PasswordRecoveryService } from '../../../services/password-recovery.service';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const next = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return next && confirm && next !== confirm ? { mismatch: true } : null;
}

/**
 * One component, two routes:
 *  - /forgot-password  (data.mode = 'request'): asks for an email and requests a reset link
 *  - /reset-password   (data.mode = 'reset'):   the emailed link; ?email= and ?token= choose a new password
 */
@Component({
  selector: 'app-password-recovery',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './password-recovery.component.html',
  styleUrl: './password-recovery.component.scss',
})
export class PasswordRecoveryComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly recovery = inject(PasswordRecoveryService);
  private readonly route = inject(ActivatedRoute);

  readonly mode: 'request' | 'reset' = this.route.snapshot.data['mode'] === 'reset' ? 'reset' : 'request';
  private readonly email = this.route.snapshot.queryParamMap.get('email') ?? '';
  private readonly token = this.route.snapshot.queryParamMap.get('token') ?? '';

  /** A reset link missing its email or token cannot work, so say so instead of showing a useless form. */
  readonly linkBroken = this.mode === 'reset' && (!this.email || !this.token);

  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly requested = signal(false);

  readonly requestForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  readonly resetForm = this.fb.nonNullable.group(
    {
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  submitRequest(): void {
    if (this.requestForm.invalid) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.recovery.requestReset(this.requestForm.getRawValue().email.trim()).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.requested.set(true);
      },
      error: () => {
        this.isSubmitting.set(false);
        this.submitError.set('Could not send the request. Please try again.');
      },
    });
  }

  submitReset(): void {
    if (this.resetForm.invalid) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.recovery.reset(this.email, this.token, this.resetForm.getRawValue().newPassword).subscribe({
      next: () => this.router.navigate(['/login'], { queryParams: { registered: 'reset' } }),
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.submitError.set(
          err.status === 400
            ? 'This reset link is invalid or has expired. Request a new one.'
            : 'Could not reset the password. Please try again.',
        );
      },
    });
  }
}