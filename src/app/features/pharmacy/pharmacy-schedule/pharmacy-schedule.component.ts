import { Component, effect, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
} from '@angular/forms';
import { PharmacyScheduleDay } from '../../../model/pharmacy-schedule.model';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth-service.service';
import { problemMessage } from '../../../services/problem-message.service';
import { PharmacyScheduleService } from '../../../services/pharmacy-schedule.service';

type DayGroup = FormGroup<{
  dayOfWeek: FormControl<number>;
  label: FormControl<string>;
  isClosed: FormControl<boolean>;
  openTime: FormControl<string>;
  closedTime: FormControl<string>;
}>;

/** Shown Monday first; the numbers are the API's System.DayOfWeek values (0 = Sunday). */
const WEEK: { dayOfWeek: number; label: string }[] = [
  { dayOfWeek: 1, label: 'Monday' },
  { dayOfWeek: 2, label: 'Tuesday' },
  { dayOfWeek: 3, label: 'Wednesday' },
  { dayOfWeek: 4, label: 'Thursday' },
  { dayOfWeek: 5, label: 'Friday' },
  { dayOfWeek: 6, label: 'Saturday' },
  { dayOfWeek: 0, label: 'Sunday' },
];

const DEFAULT_OPEN = '08:00';
const DEFAULT_CLOSE = '20:00';

/** A day that is open must close after it opens. "HH:mm" strings compare correctly as text. */
function closesAfterOpening(control: AbstractControl): ValidationErrors | null {
  const { isClosed, openTime, closedTime } = control.getRawValue();
  if (isClosed) return null;
  if (!openTime || !closedTime) return { required: true };
  return closedTime > openTime ? null : { closeBeforeOpen: true };
}

@Component({
  selector: 'app-pharmacy-schedule',
  imports: [ReactiveFormsModule],
  templateUrl: './pharmacy-schedule.component.html',
  styleUrl: './pharmacy-schedule.component.scss',
})
export class PharmacyScheduleComponent {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly scheduleService = inject(PharmacyScheduleService);
  private readonly alerts = inject(AlertService);

  // Re-runs whenever the session's pharmacyId changes; stays idle while it is null.
  readonly schedule = rxResource({
    params: () => this.auth.pharmacyId() ?? undefined,
    stream: ({ params: pharmacyId }) => this.scheduleService.getWeek(pharmacyId),
  });

  readonly days: FormArray<DayGroup> = this.fb.array<DayGroup>([]);
  readonly form = this.fb.group({ days: this.days });

  readonly saving = signal(false);

  constructor() {
    // Rebuild the form each time the server sends a week (first load, or after a save).
    effect(() => {
      const rows = this.schedule.value();
      if (rows) this.buildForm(rows);
    });
  }

  private buildForm(rows: PharmacyScheduleDay[]): void {
    this.days.clear();

    for (const { dayOfWeek, label } of WEEK) {
      const stored = rows.find((r) => r.dayOfWeek === dayOfWeek);
      this.days.push(
        this.fb.nonNullable.group(
          {
            dayOfWeek: [dayOfWeek],
            label: [label],
            isClosed: [stored?.isClosed ?? false],
            openTime: [stored?.openTime ?? DEFAULT_OPEN],
            closedTime: [stored?.closedTime ?? DEFAULT_CLOSE],
          },
          { validators: closesAfterOpening },
        ),
      );
    }

    this.form.markAsPristine();
  }

  hasCloseBeforeOpen(day: DayGroup): boolean {
    return day.hasError('closeBeforeOpen') && day.touched;
  }

  save(): void {
    const pharmacyId = this.auth.pharmacyId();
    if (pharmacyId === null) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);

    const body = this.days.controls.map((day) => {
      const v = day.getRawValue();
      return {
        dayOfWeek: v.dayOfWeek,
        isClosed: v.isClosed,
        openTime: v.openTime,
        closedTime: v.closedTime,
      };
    });

    this.scheduleService.saveWeek(pharmacyId, body).subscribe({
      next: (saved) => {
        this.saving.set(false);
        this.schedule.set(saved); // the effect rebuilds the form from what the server stored
        this.alerts.success('Opening hours saved.');
      },
      error: (err) => {
        this.saving.set(false);
        this.alerts.error(problemMessage(err, 'Could not save the opening hours.'));
      },
    });
  }

  discard(): void {
    const rows = this.schedule.value();
    if (rows) this.buildForm(rows);
  }
}