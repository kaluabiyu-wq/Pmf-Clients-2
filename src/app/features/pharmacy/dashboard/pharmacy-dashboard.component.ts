import { CommonModule } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../../services/auth-service.service';
import { PharmacyDashboardService } from '../../../services/pharmacy-dashboard.service';

interface DashboardStat {
  label: string;
  value: string;
  unit?: string;
  helper: string;
}

type DayKey = 'monFri' | 'saturday' | 'sunday';

@Component({
  selector: 'app-pharmacy-dashboard',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pharmacy-dashboard.component.html',
  styleUrl: './pharmacy-dashboard.component.scss',
})
export class PharmacyDashboardComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly dashboardService = inject(PharmacyDashboardService);

  // Re-runs whenever the session's pharmacyId changes; stays idle while it is null.
  readonly dashboard = rxResource({
    params: () => this.auth.pharmacyId() ?? undefined,
    stream: ({ params: pharmacyId }) => this.dashboardService.get(pharmacyId),
  });

  // The API has no plan data yet, so this stays a display-only constant.
  readonly planName = 'Standard plan';

  readonly verificationStatus = computed(
    () => this.dashboard.value()?.verificationStatus ?? 'pending',
  );

  readonly verificationLabel = computed(() => {
    switch (this.verificationStatus()) {
      case 'approved':
        return 'Verification: Approved';
      case 'rejected':
        return 'Verification: Rejected';
      default:
        return 'Verification: Pending';
    }
  });

  readonly stats = computed<DashboardStat[]>(() => {
    const d = this.dashboard.value();
    if (!d) return [];
    return [
      { label: 'Reliability score', value: d.reliabilityScore.toString(), unit: '/100', helper: 'Recalculated nightly' },
      { label: 'Freshness threshold', value: String(d.freshnessThreshold), unit: ' min', helper: 'Stock flags stale after' },
      { label: 'Items listed', value: String(d.itemsListed), helper: `${d.outOfStockCount} out of stock` },
      { label: 'Patient reports', value: String(d.feedbackCount), helper: `${d.unavailableReports} said unavailable` },
    ];
  });

  readonly days: { key: DayKey; label: string }[] = [
    { key: 'monFri', label: 'Mon–Fri' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  scheduleForm: FormGroup;
  savingSchedule = false;
  savedJustNow = false;

  constructor() {
    this.scheduleForm = this.fb.group({
      monFri: this.fb.group({
        open: ['08:00 AM', Validators.required],
        close: ['08:00 PM', Validators.required],
      }),
      saturday: this.fb.group({
        open: ['08:00 AM', Validators.required],
        close: ['08:00 PM', Validators.required],
      }),
      sunday: this.fb.group({
        open: ['09:00 AM', Validators.required],
        close: ['03:00 PM', Validators.required],
      }),
    });
  }

  dayGroup(key: DayKey): FormGroup {
    return this.scheduleForm.get(key) as FormGroup;
  }

  saveChanges(): void {
    if (this.scheduleForm.invalid) {
      this.scheduleForm.markAllAsTouched();
      return;
    }

    this.savingSchedule = true;
    this.savedJustNow = false;

    setTimeout(() => {
      this.savingSchedule = false;
      this.savedJustNow = true;
      setTimeout(() => (this.savedJustNow = false), 2500);
    }, 500);
  }

  markHolidayClosure(): void {}
}