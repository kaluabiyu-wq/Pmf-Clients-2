import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { defer, interval, map } from 'rxjs';

import { AdminService } from '../../../services/admin.service';

const HEALTH_REFRESH_MS = 30_000;

@Component({
  selector: 'app-overview',
  imports: [RouterLink, DatePipe],
  templateUrl: './overview.component.html',
  styleUrl: '../sysadmin-shared.scss',
})
export class OverviewComponent {
  private readonly admin = inject(AdminService);

  readonly overview = rxResource({ stream: () => this.admin.overview() });

  /** Health plus the browser-measured round trip, so a slow network shows up as well as a slow database. */
  readonly health = rxResource({
    stream: () =>
      defer(() => {
        const started = performance.now();
        return this.admin
          .health()
          .pipe(map((h) => ({ ...h, roundTripMs: Math.round(performance.now() - started) })));
      }),
  });

  /** Tallest bar of the sign-up chart, so bars scale to the busiest day. */
  readonly maxSignups = computed(() =>
    Math.max(1, ...(this.overview.value()?.signupsLast14Days.map((d) => d.count) ?? [0])),
  );

  constructor() {
    interval(HEALTH_REFRESH_MS)
      .pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.health.reload());
  }

  refresh(): void {
    this.overview.reload();
    this.health.reload();
  }

  uptime(seconds: number): string {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return d > 0 ? `${d}d ${h}h` : h > 0 ? `${h}h ${m}m` : `${m}m`;
  }

  label(action: string): string {
    const spaced = action.replace(/([a-z])([A-Z])/g, '$1 $2');
    return spaced.charAt(0) + spaced.slice(1).toLowerCase();
  }

  shortDay(iso: string): string {
    return iso.slice(8, 10);
  }
}