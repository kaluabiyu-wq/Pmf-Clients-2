import { Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { switchMap } from 'rxjs';

import { AdminUserCreated } from '../../../model/admin.model';
import { AdminService } from '../../../services/admin.service';
import { AlertService } from '../../../services/alert.service';
import { LocationService } from '../../../services/location.service';
import { problemMessage } from '../../../services/problem-message.service';
import { LocationFieldsComponent } from '../../../ui/location-fields/location-fields.componenet';

@Component({
  selector: 'app-user-create',
  imports: [ReactiveFormsModule, RouterLink, LocationFieldsComponent],
  templateUrl: './user-create.component.html',
  styleUrl: '../sysadmin-shared.scss',
})
export class UserCreateComponent {
  private readonly fb = inject(FormBuilder);
  private readonly admin = inject(AdminService);
  private readonly alerts = inject(AlertService);
  private readonly locationService = inject(LocationService);

  readonly roles = rxResource({ stream: () => this.admin.roles() });
  readonly saving = signal(false);
  readonly created = signal<AdminUserCreated | null>(null);

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
    roleId: [0, [Validators.min(1)]],
    password: ['', [Validators.minLength(8), Validators.maxLength(100)]],
    sendResetEmail: [false],
    location: this.locationGroup,
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const loc = v.location;

    this.saving.set(true);
    this.locationService
      .create({
        label: loc.label,
        subcity: loc.subcity,
        woreda: loc.woreda,
        coordinate: { latitude: loc.latitude!, longitude: loc.longitude! },
      })
      .pipe(
        switchMap((location) =>
          this.admin.createUser({
            fullName: v.fullName.trim(),
            email: v.email.trim(),
            password: v.password || undefined,
            roleId: v.roleId,
            locationId: location.id,
            sendResetEmail: v.sendResetEmail,
          }),
        ),
      )
      .subscribe({
        next: (result) => {
          this.saving.set(false);
          this.created.set(result);
          this.alerts.success('Account created.');
        },
        error: (err) => {
          this.saving.set(false);
          this.alerts.error(problemMessage(err, 'Could not create the account.'));
        },
      });
  }

  async copy(value: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(value);
      this.alerts.success('Copied.');
    } catch {
      this.alerts.info('Could not copy automatically — select it and copy.');
    }
  }
}