import { Component, computed, inject, input } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { PharmacyScheduleService } from '../../../services/pharmacy-schedule.service';

const WEEK: { dayOfWeek: number; label: string }[] = [
  { dayOfWeek: 1, label: 'Monday' },
  { dayOfWeek: 2, label: 'Tuesday' },
  { dayOfWeek: 3, label: 'Wednesday' },
  { dayOfWeek: 4, label: 'Thursday' },
  { dayOfWeek: 5, label: 'Friday' },
  { dayOfWeek: 6, label: 'Saturday' },
  { dayOfWeek: 0, label: 'Sunday' },
];


@Component({
  selector: 'app-pharmacy-opening-hours',
  templateUrl: './pharmacy-opening-hours.component.html',
  styleUrl: './pharmacy-opening-hours.component.scss',
})
export class PharmacyOpeningHoursComponent {
  private readonly scheduleService = inject(PharmacyScheduleService);

  readonly pharmacyId = input.required<number>();

  // Re-fetches whenever the pharmacyId input changes.
  readonly schedule = rxResource({
    params: () => this.pharmacyId(),
    stream: ({ params: pharmacyId }) => this.scheduleService.getWeek(pharmacyId),
  });

  readonly hasSchedule = computed(() => (this.schedule.value()?.length ?? 0) > 0);

  readonly rows = computed(() => {
    const stored = this.schedule.value() ?? [];
    return WEEK.map(({ dayOfWeek, label }) => ({
      dayOfWeek,
      label,
      day: stored.find((d) => d.dayOfWeek === dayOfWeek),
    }));
  });
}