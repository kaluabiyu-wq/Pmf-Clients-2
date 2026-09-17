import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PharmacyAdminManageService } from '../../services/pharmacy-admin-manage.service';
import { LocationService } from '../../services/location.service';
import {
  PharmacyAdminProfile,
  PharmacyStatusUpdateRequest,
  PharmacyUpdateRequest,
} from '../../model/pharmacy-admin-manage.model';
import { Location as PmfLocation } from '../../model/location.model';


@Component({
  selector: 'app-pharmacy-admin-managesdetail',
  imports: [CommonModule, FormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './pharmacy-admin-managesdetail.componenet.html',
  styleUrl: './pharmacy-admin-managesdetail.componenet.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PharmacyAdminManagesdetailComponenet implements OnInit {
  private readonly pharmacyAdminManageService = inject(PharmacyAdminManageService);
  private readonly locationService = inject(LocationService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  private pharmacyId!: number;

  readonly profile = signal<PharmacyAdminProfile | null>(null);
  readonly isLoading = signal(true);
  readonly loadError = signal<string | null>(null);

  readonly locations = signal<PmfLocation[]>([]);

  //Edit-profile
  readonly editName = signal('');
  readonly editLicenseNumber = signal('');
  readonly editLocationId = signal<number | null>(null);
  readonly editPhoneNumber = signal<number | null>(null);
  readonly editEmail = signal('');
  readonly editFreshnessThreshold = signal<number | null>(null);
  readonly isSavingProfile = signal(false);
  readonly profileSaveError = signal<string | null>(null);
  readonly profileSaveMessage = signal('');

  //Status
  readonly statusIsVerified = signal(false);
  readonly statusIsActive = signal(false);
  readonly statusReason = signal('');
  readonly isSavingStatus = signal(false);
  readonly statusSaveError = signal<string | null>(null);
  readonly statusSaveMessage = signal('');

  //Delete
  readonly isDeleting = signal(false);
  readonly deleteError = signal<string | null>(null);
  readonly confirmingDelete = signal(false);

  readonly canSubmitProfile = computed(
    () =>
      this.editName().trim().length > 0 &&
      this.editLicenseNumber().trim().length > 0 &&
      this.editLocationId() !== null &&
      this.editFreshnessThreshold() !== null &&
      this.editFreshnessThreshold()! >= 0 &&
      this.editFreshnessThreshold()! <= 100,
  );

  ngOnInit(): void {
    this.pharmacyId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadProfile();
    this.locationService.getAll({ pageSize: 200 }).subscribe({
      next: (response) => this.locations.set(response.items),
      error: () => undefined,
    });
  }

  onBack(): void {
    this.router.navigate(['/pharmacy-admin-manages']);
  }

  saveProfile(): void {
    if (!this.canSubmitProfile()) return;

    this.isSavingProfile.set(true);
    this.profileSaveError.set(null);
    this.profileSaveMessage.set('');

    const request: PharmacyUpdateRequest = {
      name: this.editName().trim(),
      licenseNumber: this.editLicenseNumber().trim(),
      locationId: this.editLocationId()!,
      phoneNumber: this.editPhoneNumber() ?? 0,
      email: this.editEmail().trim() || null,
      freshnessThreshold: this.editFreshnessThreshold()!,
    };

    this.pharmacyAdminManageService.update(this.pharmacyId, request).subscribe({
      next: () => {
        this.isSavingProfile.set(false);
        this.profileSaveMessage.set('Profile updated.');
        this.loadProfile();
      },
      error: () => {
        this.isSavingProfile.set(false);
        this.profileSaveError.set(
          'Could not save changes. Check that all fields are filled in correctly.',
        );
      },
    });
  }

  saveStatus(): void {
    this.isSavingStatus.set(true);
    this.statusSaveError.set(null);
    this.statusSaveMessage.set('');

    const request: PharmacyStatusUpdateRequest = {
      isVerified: this.statusIsVerified(),
      isActive: this.statusIsActive(),
      reason: this.statusReason().trim() || null,
    };

    this.pharmacyAdminManageService.setStatus(this.pharmacyId, request).subscribe({
      next: () => {
        this.isSavingStatus.set(false);
        this.statusSaveMessage.set('Status updated.');
        this.statusReason.set('');
        this.loadProfile();
      },
      error: () => {
        this.isSavingStatus.set(false);
        this.statusSaveError.set('Could not update status. Please try again.');
      },
    });
  }

  requestDelete(): void {
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  confirmDelete(): void {
    this.isDeleting.set(true);
    this.deleteError.set(null);

    this.pharmacyAdminManageService.delete(this.pharmacyId).subscribe({
      next: () => {
        this.router.navigate(['/pharmacy-admin-manages']);
      },
      error: () => {
        this.isDeleting.set(false);
        this.confirmingDelete.set(false);
        this.deleteError.set('Could not remove this pharmacy. Please try again.');
      },
    });
  }

  private loadProfile(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.pharmacyAdminManageService.getProfile(this.pharmacyId).subscribe({
      next: (profile) => {
        this.profile.set(profile);
        this.isLoading.set(false);

        this.editName.set(profile.name);
        this.editLicenseNumber.set(profile.licenseNumber);
        this.editLocationId.set(profile.locationId);
        this.editPhoneNumber.set(profile.phoneNumber);
        this.editEmail.set(profile.email ?? '');
        this.editFreshnessThreshold.set(profile.freshnessThreshold);

        this.statusIsVerified.set(profile.isVerified);
        this.statusIsActive.set(profile.isActive);
      },
      error: () => {
        this.isLoading.set(false);
        this.loadError.set('This pharmacy could not be found.');
      },
    });
  }
}
