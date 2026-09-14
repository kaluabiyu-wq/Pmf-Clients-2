import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PharmacyStaffService } from '../../services/pharmacy-staff.service';
import { UserService } from '../../services/user.service';
import { PharmacyStaffResponse, PHARMACY_STAFF_POSITIONS } from '../../model/pharmacy-staff.model';
import { User } from '../../model/user.model';

@Component({
  selector: 'app-pharmacy-staff',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './pharmacy-staff.component.html',
  styleUrl: './pharmacy-staff.component.scss',
})
export class PharmacyStaffComponent implements OnInit {
  private readonly pharmacyStaffService = inject(PharmacyStaffService);
  private readonly userService = inject(UserService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly positions = PHARMACY_STAFF_POSITIONS;

  pharmacyId!: number;

  staff = signal<PharmacyStaffResponse[]>([]);
  loading = signal(false);
  error = signal('');

  foundUser = signal<User | null>(null);
  lookupError = signal('');
  lookupLoading = signal(false);

  isSubmitting = signal(false);
  submitError = signal('');

  lookupForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  staffForm = this.fb.nonNullable.group({
    position: ['Pharmacist', Validators.required],
    isActive: [true],
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const pharmacyId = Number(params.get('pharmacyId'));

      if (!pharmacyId) {
        this.error.set('Invalid pharmacy ID.');
        return;
      }

      this.pharmacyId = pharmacyId;
      this.loadStaff();
    });
  }

  loadStaff(): void {
    this.loading.set(true);
    this.error.set('');

    this.pharmacyStaffService.getByPharmacy(this.pharmacyId).subscribe({
      next: (staff) => {
        this.staff.set(staff);
        this.loading.set(false);
      },

      error: (error) => {
        console.error('Failed to load pharmacy staff:', error);

        this.error.set(
          error?.error?.detail ||
            error?.error?.message ||
            'Failed to load pharmacy staff.',
        );

        this.loading.set(false);
      },
    });
  }

  lookupUser(): void {
    if (this.lookupForm.invalid) {
      this.lookupForm.markAllAsTouched();
      return;
    }

    this.lookupLoading.set(true);
    this.lookupError.set('');
    this.foundUser.set(null);

    const email = this.lookupForm.getRawValue().email;

    this.userService.getByEmail(email).subscribe({
      next: (user) => {
        this.foundUser.set(user);
        this.lookupLoading.set(false);
      },

      error: (error) => {
        console.error('Failed to find user:', error);

        this.lookupError.set(
          error?.error?.detail ||
            error?.error?.message ||
            'No user found with that email.',
        );

        this.lookupLoading.set(false);
      },
    });
  }

  clearLookup(): void {
    this.foundUser.set(null);
    this.lookupError.set('');
    this.lookupForm.reset();
  }

  addStaff(): void {
    const user = this.foundUser();

    if (!user) {
      this.submitError.set('Look up a user by email before adding them as staff.');
      return;
    }

    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set('');

    const { position, isActive } = this.staffForm.getRawValue();

    this.pharmacyStaffService
      .create(this.pharmacyId, { userId: user.id, position, isActive })
      .subscribe({
        next: (created) => {
          this.staff.update((current) => [...current, created]);
          this.isSubmitting.set(false);
          this.clearLookup();
          this.staffForm.reset({ position: 'Pharmacist', isActive: true });
        },

        error: (error) => {
          console.error('Failed to add pharmacy staff:', error);

          this.isSubmitting.set(false);
          this.submitError.set(
            error?.error?.detail ||
              error?.error?.message ||
              'Could not add this staff member.',
          );
        },
      });
  }

  deactivate(member: PharmacyStaffResponse): void {
    this.pharmacyStaffService.deactivate(this.pharmacyId, member.id).subscribe({
      next: (updated) => {
        this.staff.update((current) =>
          current.map((entry) => (entry.id === updated.id ? updated : entry)),
        );
      },

      error: (error) => {
        console.error('Failed to deactivate staff member:', error);

        this.error.set(
          error?.error?.detail ||
            error?.error?.message ||
            'Could not revoke this staff member.',
        );
      },
    });
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString();
  }

  goBack(): void {
    this.router.navigate(['/pharmacy-admin']);
  }
}