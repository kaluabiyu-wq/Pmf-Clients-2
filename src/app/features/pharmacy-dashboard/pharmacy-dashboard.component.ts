import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

interface DashboardStat {
  label: string;value: string;
  unit?: string;helper: string;
}

type DayKey = 'monFri' | 'saturday' | 'sunday';

@Component({
  selector: 'app-pharmacy-dashboard',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './pharmacy-dashboard.component.html',
  styleUrl: './pharmacy-dashboard.component.scss',
})
export class PharmacyDashboardComponent {

  verificationStatus: 'approved' | 'pending' | 'rejected' = 'approved';
   planName = 'Standard plan';

  get verificationLabel(): string {
    switch (this.verificationStatus) {
      case 'approved':
        return 'Verification: Approved';
      case 'pending':
        return 'Verification: Pending';
      default:
        return 'Verification: Rejected';
    }
  }
  stats: DashboardStat[] = [
    { label: 'Reliability score', value: '85', unit: '/100', helper: 'Recalculated nightly' },
    { label: 'Freshness threshold', value: '1h', helper: 'Stock flags stale after' },
    { label: 'Items listed', value: '30', helper: '1 out of stock' },
    { label: 'Searches today', value: '5', helper: 'Where you appeared' },
  ];
  readonly days: { key: DayKey; label: string }[] = [
    { key: 'monFri', label: 'Mon–Fri' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' },
  ];

  scheduleForm: FormGroup;
  savingSchedule = false;
  savedJustNow = false;

  constructor(private fb: FormBuilder) {
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

  markHolidayClosure(): void {
   }
}