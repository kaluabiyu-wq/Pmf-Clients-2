import { CurrencyPipe, DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { OrderResponse } from '../../../model/order.model';
import { ServerAlert } from '../../../model/serverAlert.model';
import { AuthService } from '../../../services/auth-service.service';
import { FavoriteService } from '../../../services/favorite.service';
import { OrderService } from '../../../services/order.service';
import { PharmacyListService } from '../../../services/pharmacy-list.service';
import { PrescriptionService } from '../../../services/prescription.service';
import { ServerAlertService } from '../../../services/serveralert.service';
import { MedicineSearchComponent } from '../medicine-search/medicine-search.component';

/** How many rows each dashboard panel shows; the full lists live on their own pages. */
const RECENT_ORDERS = 3;
const RECENT_ALERTS = 5;
const SHOWN_FAVOURITES = 4;

interface QuickLink {
  label: string;
  hint: string;
  path: string;
}

@Component({
  selector: 'app-patient-dashboard',
  imports: [CurrencyPipe, DatePipe, LowerCasePipe, RouterLink, MedicineSearchComponent],
  templateUrl: './patient-dashboard.component.html',
  styleUrl: './patient-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientDashboardComponent {
  private readonly auth = inject(AuthService);
  private readonly orderService = inject(OrderService);
  private readonly alertApi = inject(ServerAlertService);
  private readonly favoriteService = inject(FavoriteService);
  private readonly pharmacyList = inject(PharmacyListService);
  private readonly prescriptions = inject(PrescriptionService);
  private readonly router = inject(Router);

  readonly userId = computed(() => this.auth.currentUser()?.id ?? null);
  readonly firstName = computed(() => {
    const full = this.auth.currentUser()?.fullName?.trim();
    return full ? full.split(/\s+/)[0] : null;
  });

  // ---------- Data ----------
  // Every panel loads on its own, so one slow or failing request leaves the rest usable.

  readonly unread = rxResource({ stream: () => this.alertApi.getUnreadCount() });

  readonly alerts = rxResource({
    stream: () => this.alertApi.getMine({ page: 1, pageSize: RECENT_ALERTS }),
  });

  /** Pending orders: the "needs attention" list and the "active orders" count both come from here. */
  readonly pendingOrders = rxResource({
    stream: () => this.orderService.getMine({ status: 'Pending', page: 1, pageSize: 20 }),
  });

  readonly recentOrders = rxResource({
    stream: () => this.orderService.getMine({ page: 1, pageSize: RECENT_ORDERS }),
  });

  readonly favourites = rxResource({
    params: () => this.userId() ?? undefined,
    stream: ({ params }) => this.favoriteService.getByUser(params),
  });

  /** Only requested once there is at least one favourite to put a name to. */
  readonly pharmacyNames = rxResource({
    params: () => (this.favourites.hasValue() && this.favourites.value().length > 0 ? true : undefined),
    stream: () =>
      this.pharmacyList.getAll({ pageSize: 100 }).pipe(
        map((page) => new Map(page.items.map((p) => [p.id, p.name] as const))),
        catchError(() => of(new Map<number, string>())),
      ),
  });

  // ---------- Derived view state ----------

  readonly unreadCount = computed(() => (this.unread.hasValue() ? this.unread.value().count : null));
  readonly alertRows = computed(() => (this.alerts.hasValue() ? this.alerts.value().items : []));
  readonly recentRows = computed(() => (this.recentOrders.hasValue() ? this.recentOrders.value().items : []));
  readonly pendingCount = computed(() => (this.pendingOrders.hasValue() ? this.pendingOrders.value().totalCount : null));
  readonly favouriteCount = computed(() => (this.favourites.hasValue() ? this.favourites.value().length : null));

  /** Pending orders that cannot move forward until the patient uploads (or re-uploads) a prescription. */
  readonly needsAttention = computed(() =>
    (this.pendingOrders.hasValue() ? this.pendingOrders.value().items : []).filter((o) => this.needsPrescription(o)),
  );

  readonly favouriteRows = computed(() => {
    const names = this.pharmacyNames.hasValue() ? this.pharmacyNames.value() : new Map<number, string>();
    return (this.favourites.hasValue() ? this.favourites.value() : [])
      .slice(0, SHOWN_FAVOURITES)
      .map((f) => ({ id: f.id, pharmacyId: f.pharmacyId, name: names.get(f.pharmacyId) ?? `Pharmacy #${f.pharmacyId}` }));
  });

  readonly quickLinks = computed<QuickLink[]>(() => [
    { label: 'Browse medicines', hint: 'Full catalogue with details', path: '/patient/medicine' },
    { label: 'Find pharmacies', hint: 'Locations and opening hours', path: '/patient/pharmacy-list' },
    { label: 'My orders', hint: 'Track and manage orders', path: '/patient/orders' },
    {
      label: 'Favourite pharmacies',
      hint: 'Your saved pharmacies',
      path: this.userId() ? `/patient/favourite/${this.userId()}` : '/patient/pharmacy-list',
    },
    { label: 'My account', hint: 'Profile and password', path: '/patient/my-account' },
  ]);

  readonly markingAll = signal(false);

  // ---------- Actions ----------

  needsPrescription(o: OrderResponse): boolean {
    return (
      o.status === 'Pending' &&
      o.requiresPrescription &&
      (o.prescriptionStatus === null || o.prescriptionStatus === 'Rejected')
    );
  }

  attentionText(o: OrderResponse): string {
    return o.prescriptionStatus === 'Rejected'
      ? 'Prescription rejected: upload a new one.'
      : 'Prescription required: upload it to continue.';
  }

  itemsSummary(o: OrderResponse): string {
    const names = o.items.map((i) => i.genericName);
    const shown = names.slice(0, 2).join(', ');
    return names.length > 2 ? `${shown} +${names.length - 2} more` : shown;
  }

  /** Mark the alert read (fire and forget) and jump to the thing it is about. */
  openAlert(alert: ServerAlert): void {
    if (!alert.isRead) {
      this.alertApi.markRead(alert.id).subscribe({
        next: () => this.refreshAlerts(),
        error: () => undefined, // The badge simply stays; navigation is not blocked by it.
      });
    }

    if (alert.referenceTable === 'Orders') {
      this.router.navigate(['/patient/orders', alert.referenceId]);
    } else if (alert.referenceTable === 'Prescriptions') {
      // referenceId is the prescription's id, but the page lives under its order.
      this.prescriptions.getById(alert.referenceId).subscribe({
        next: (p) => this.router.navigate(['/patient/orders', p.orderId]),
        error: () => this.router.navigate(['/patient/orders']),
      });
    }
  }

  markAllRead(): void {
    this.markingAll.set(true);
    this.alertApi.markAllRead().subscribe({
      next: () => {
        this.markingAll.set(false);
        this.refreshAlerts();
      },
      error: () => this.markingAll.set(false),
    });
  }

  private refreshAlerts(): void {
    this.alerts.reload();
    this.unread.reload();
  }
}