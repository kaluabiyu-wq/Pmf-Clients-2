import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';

import { AccountProfile } from '../../../model/account.model';
import { AccountService } from '../../../services/account.service';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth-service.service';
import { LocationService } from '../../../services/location.service';
import { problemMessage } from '../../../services/problem-message.service';
import { LocationFieldsComponent } from '../../../ui/location-fields/location-fields.componenet';

function passwordsMatch(group: AbstractControl): ValidationErrors | null {
  const next = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return next && confirm && next !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-my-account',
  imports: [ReactiveFormsModule, RouterLink, DatePipe, LocationFieldsComponent],
  templateUrl: './my-account.component.html',
  styleUrl: './my-account.component.scss',
})
export class MyAccountComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly auth = inject(AuthService);
  private readonly alerts = inject(AlertService);
  private readonly accountService = inject(AccountService);
  private readonly locationService = inject(LocationService);

  readonly account = rxResource({ stream: () => this.accountService.get() });



  readonly editing = signal(false);
  readonly saving = signal(false);

  readonly locationGroup = this.fb.group({
    label: this.fb.nonNullable.control('', Validators.required),
    subcity: this.fb.nonNullable.control('', Validators.required),
    woreda: this.fb.nonNullable.control('', Validators.required),
    latitude: new FormControl<number | null>(null, Validators.required),
    longitude: new FormControl<number | null>(null, Validators.required),
  });

  readonly form = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
    location: this.locationGroup,
  });

  startEdit(): void {
    const a = this.account.value();
    if (!a) return;

    this.form.reset({
      fullName: a.fullName,
      email: a.email,
      location: {
        label: a.locationLabel,
        subcity: a.subcity,
        woreda: a.woreda,
        latitude: a.latitude,
        longitude: a.longitude,
      },
    });
    this.locationGroup.markAsPristine();
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  saveDetails(): void {
    const a = this.account.value();
    if (!a) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const loc = raw.location;

    // A new place is its own location row (as at sign-up); only create one if the person changed it.
    const locationId$: Observable<number | undefined> = this.locationGroup.dirty
      ? this.locationService
          .create({
            label: loc.label,
            subcity: loc.subcity,
            woreda: loc.woreda,
            coordinate: { latitude: loc.latitude!, longitude: loc.longitude! },
          })
          .pipe(switchMap((created) => of(created.id)))
      : of(undefined);

    this.saving.set(true);
    locationId$
      .pipe(
        switchMap((locationId) =>
          this.accountService.update({
            fullName: raw.fullName.trim(),
            email: raw.email.trim(),
            ...(locationId !== undefined ? { locationId } : {}),
          }),
        ),
      )
      .subscribe({
        next: (updated) => {
          this.saving.set(false);
          this.editing.set(false);
          this.afterUpdate(updated);
          this.alerts.success('Your details were saved.');
          this.account.reload();
        },
        error: (err) => {
          this.saving.set(false);
          this.alerts.error(problemMessage(err, 'Could not save your details.'));
        },
      });
  }

  private afterUpdate(updated: AccountProfile): void {
    this.auth.updateIdentity(updated.fullName, updated.email);
    this.auth.setLocation(updated.locationId, updated.locationLabel);
  }

  // ---------- Password ----------

  readonly changingPassword = signal(false);
  readonly passwordForm = this.fb.nonNullable.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(100)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const { currentPassword, newPassword } = this.passwordForm.getRawValue();
    this.changingPassword.set(true);
    this.accountService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.changingPassword.set(false);
        this.passwordForm.reset();
        this.alerts.success('Your password was changed.');
      },
      error: (err) => {
        this.changingPassword.set(false);
        this.alerts.error(problemMessage(err, 'Could not change the password.'));
      },
    });
  }

  // ---------- Delete ----------

  readonly confirmingDelete = signal(false);
  readonly deleting = signal(false);
  readonly deletePassword = this.fb.nonNullable.control('', Validators.required);
  readonly hasOpenOrders = computed(() => (this.account.value()?.openOrderCount ?? 0) > 0);

  startDelete(): void {
    this.deletePassword.reset('');
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  confirmDelete(): void {
    if (this.deletePassword.invalid || this.hasOpenOrders()) return;

    this.deleting.set(true);
    this.accountService.delete(this.deletePassword.value).subscribe({
      next: () => {
        this.deleting.set(false);
        this.alerts.success('Your account was deleted.');
        this.auth.logout();
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.deleting.set(false);
        this.alerts.error(problemMessage(err, 'Could not delete your account.'));
      },
    });
  }
}