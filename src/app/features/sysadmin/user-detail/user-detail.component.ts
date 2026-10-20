import { DatePipe } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { AdminUserDetail } from '../../../model/admin.model';
import { AdminService } from '../../../services/admin.service';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth-service.service';
import { problemMessage } from '../../../services/problem-message.service';

@Component({
  selector: 'app-user-detail',
  imports: [ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './user-detail.component.html',
  styleUrl: '../sysadmin-shared.scss',
})
export class UserDetailComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly admin = inject(AdminService);
  private readonly alerts = inject(AlertService);
  private readonly auth = inject(AuthService);

  readonly id = Number(inject(ActivatedRoute).snapshot.paramMap.get('id'));

  readonly detail = rxResource({ stream: () => this.admin.getUser(this.id) });
  readonly roles = rxResource({ stream: () => this.admin.roles() });

  /** The server refuses these on your own account; the page just explains it up front. */
  readonly isSelf = computed(() => this.auth.currentUser()?.id === this.id);

  /** Which action is running, so only its button shows "Working…". */
  readonly busy = signal<string | null>(null);

  readonly profileForm = this.fb.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(200)]],
  });

  readonly roleChoice = signal<number | null>(null);
  readonly suspendReason = this.fb.nonNullable.control('', Validators.maxLength(300));
  readonly confirmingSuspend = signal(false);
  readonly tempPassword = signal<string | null>(null);
  readonly confirmingDelete = signal(false);
  readonly deleteConfirmEmail = this.fb.nonNullable.control('');

  constructor() {
    // Whenever the account loads or changes, put its values back into the editable controls.
    effect(() => {
      const d = this.detail.value();
      if (!d) return;
      this.profileForm.reset({ fullName: d.user.fullName, email: d.user.email });
      this.roleChoice.set(d.user.roleId);
    });
  }

  // ---------- Profile ----------

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    const v = this.profileForm.getRawValue();
    this.run('profile', this.admin.updateUser(this.id, { fullName: v.fullName.trim(), email: v.email.trim() }),
      'Account details saved.', 'Could not save the details.');
  }

  // ---------- Role ----------

  saveRole(): void {
    const roleId = this.roleChoice();
    if (roleId === null) return;
    this.run('role', this.admin.changeRole(this.id, roleId), 'Role updated.', 'Could not change the role.');
  }

  // ---------- Status ----------

  suspend(): void {
    this.run('suspend', this.admin.setStatus(this.id, 'Suspended', this.suspendReason.value.trim() || undefined),
      'Account suspended. It is signed out within seconds.', 'Could not suspend the account.',
      () => { this.confirmingSuspend.set(false); this.suspendReason.reset(''); });
  }

  deactivate(): void {
    if (!window.confirm('Deactivate this account? The person will be signed out and cannot log in until you restore it.')) return;
    this.run('deactivate', this.admin.setStatus(this.id, 'Inactive'),
      'Account deactivated.', 'Could not deactivate the account.');
  }

  restore(): void {
    this.run('restore', this.admin.setStatus(this.id, 'Active'),
      'Account restored. The person can log in again.', 'Could not restore the account.');
  }

  // ---------- Password ----------

  setTemporaryPassword(): void {
    if (!window.confirm('Replace this person\'s password with a temporary one? Their current password stops working.')) return;

    this.busy.set('password');
    this.admin.resetPassword(this.id).subscribe({
      next: (r) => {
        this.busy.set(null);
        this.tempPassword.set(r.temporaryPassword);
      },
      error: (err) => {
        this.busy.set(null);
        this.alerts.error(problemMessage(err, 'Could not reset the password.'));
      },
    });
  }

  async copyPassword(): Promise<void> {
    const value = this.tempPassword();
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      this.alerts.success('Copied.');
    } catch {
      this.alerts.info('Could not copy automatically — select the password and copy it.');
    }
  }

  hidePassword(): void {
    this.tempPassword.set(null);
  }

  sendResetEmail(): void {
    this.busy.set('email');
    this.admin.sendResetEmail(this.id).subscribe({
      next: (r) => {
        this.busy.set(null);
        if (r.emailSent) this.alerts.success(r.message);
        else this.alerts.error(r.message);
      },
      error: (err) => {
        this.busy.set(null);
        this.alerts.error(problemMessage(err, 'Could not send the email.'));
      },
    });
  }

  // ---------- Delete ----------

  canConfirmDelete(email: string): boolean {
    return this.deleteConfirmEmail.value.trim().toLowerCase() === email.toLowerCase();
  }

  confirmDelete(email: string): void {
    if (!this.canConfirmDelete(email)) return;

    this.busy.set('delete');
    this.admin.deleteUser(this.id, this.deleteConfirmEmail.value.trim()).subscribe({
      next: () => {
        this.busy.set(null);
        this.alerts.success('Account deleted. Personal details were anonymised; orders and reviews are kept.');
        this.router.navigateByUrl('/sysadmin/users');
      },
      error: (err) => {
        this.busy.set(null);
        this.alerts.error(problemMessage(err, 'Could not delete the account.'));
      },
    });
  }

  // ---------- Helpers ----------

  private run(
    key: string,
    call: Observable<AdminUserDetail>,
    success: string,
    failure: string,
    after?: () => void,
  ): void {
    this.busy.set(key);
    call.subscribe({
      next: (updated) => {
        this.busy.set(null);
        this.detail.value.set(updated);
        this.alerts.success(success);
        after?.();
      },
      error: (err) => {
        this.busy.set(null);
        this.alerts.error(problemMessage(err, failure));
      },
    });
  }
}