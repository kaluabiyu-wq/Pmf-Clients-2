import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../../services/auth-service.service';
import { homeFor } from '../../auth/role-access';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.componenet.html',
  styleUrl: './login.componenet.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);

  // Set by the signup pages via ?registered=patient|pharmacy
  readonly notice = signal<string | null>(this.noticeFromQuery());

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.notice.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl(homeFor(this.auth.role())),
      error: (err: HttpErrorResponse) => {
        this.isSubmitting.set(false);
        this.submitError.set(
          err.status === 401 || err.status === 400
            ? 'Invalid email or password.'
            : err.status === 0
              ? 'Cannot reach the server. Please try again.'
              : 'Login failed. Please try again.',
        );
      },
    });
  }

  private noticeFromQuery(): string | null {
    switch (this.route.snapshot.queryParamMap.get('registered')) {
      case 'patient':
        return 'Account created. Log in to continue.';
      case 'pharmacy':
        return 'Registration received. Your documents will be reviewed by an admin before your pharmacy is verified.';
      default:
        return null;
    }
  }
}