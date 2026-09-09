import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LocationService } from '../../services/location.service';
import { UserService } from '../../services/user.service';
import { USER_ROLES } from '../../model/user.model';

@Component({
  selector: 'app-user',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(UserService);
  private readonly locationService = inject(LocationService);
  private readonly router = inject(Router);

  readonly roles = USER_ROLES;

  readonly isSubmitting = signal(false);
  readonly submitError = signal<string | null>(null);

 
  readonly locationsResource = rxResource({
    stream: () => this.locationService.getAll({ pageSize: 200 }),
  });

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    locationId: [null as number | null, Validators.required],
    roleId: [this.roles[0].id, Validators.required],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);

    const raw = this.form.getRawValue();

    this.api
      .create({
        fullName: raw.fullName,
        email: raw.email,
        password: raw.password,
        locationId: raw.locationId as number,
        roleId: raw.roleId,
      })
      .subscribe({
        next: () => {
          this.isSubmitting.set(false);
          this.router.navigate(['/']);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.submitError.set(this.extractErrorMessage(err));
          console.error(err);
        },
      });
  }

  onCancel(): void {
    this.router.navigate(['/']);
  }

  private extractErrorMessage(err: unknown): string {
    if (
      err &&
      typeof err === 'object' &&
      'status' in err &&
      (err as { status: number }).status === 0
    ) {
      return 'Could not reach the server. Check that the API is running and that CORS allows this origin.';
    }
    if (
      err &&
      typeof err === 'object' &&
      'status' in err &&
      (err as { status: number }).status === 400
    ) {
      return 'Some details were rejected by the server. Double-check the form and try again.';
    }
    return 'Could not create the account. Make sure your .NET API is running.';
  }
}