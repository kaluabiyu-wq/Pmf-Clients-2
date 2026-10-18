import { CurrencyPipe, DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderPage, OrderResponse, OrderStatus } from '../../../model/order.model';
import { AuthService } from '../../../services/auth-service.service';
import { OrderService } from '../../../services/order.service';
import { problemMessage } from '../../../services/problem-message.service';
import { PrescriptionPanelComponent } from '../../../ui/prescription-panel/prescription-panel.component';
import { PrescriptionQueueComponent } from '../prescription-queue/prescription-queue.component';

@Component({
  selector: 'app-pharmacy-orders',
  imports: [CurrencyPipe, DatePipe, LowerCasePipe, RouterLink, PrescriptionPanelComponent, PrescriptionQueueComponent],
  templateUrl: './pharmacy-orders.componenet.html',
  styleUrl: '../../auth/orders-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PharmacyOrdersComponent {
  private readonly auth = inject(AuthService);
  private readonly orderService = inject(OrderService);

  // Set by the PharmacyAdmin pharmacy picker; null for a pharmacy owner, who is scoped to their own pharmacy.
  readonly pharmacyId = input<number | null>(null);
  readonly activePharmacyId = computed(() => this.pharmacyId() ?? this.auth.pharmacyId());
  /** True when a platform admin is looking at someone else's pharmacy. */
  readonly adminView = computed(() => this.pharmacyId() !== null);

  readonly statuses: (OrderStatus | null)[] = ['Pending', 'Confirmed', 'Cancelled', null];
  readonly status = signal<OrderStatus | null>('Pending');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly busyId = signal<number | null>(null);
  readonly actionError = signal<string | null>(null);

  readonly orders = rxResource({
    params: () => {
      const pharmacyId = this.activePharmacyId();
      if (pharmacyId === null) return undefined; // stay idle until we know the pharmacy
      return { pharmacyId, status: this.status(), page: this.page() };
    },
    stream: ({ params }) =>
      this.orderService.getByPharmacy(params.pharmacyId, {
        status: params.status ?? undefined,
        page: params.page,
        pageSize: this.pageSize,
      }),
  });

  readonly data = linkedSignal<OrderPage | undefined, OrderPage | undefined>({
    source: () => this.orders.value(),
    computation: (current, previous) => current ?? previous?.value,
  });
  readonly rows = computed(() => this.data()?.items ?? []);

  setStatus(s: OrderStatus | null): void {
    this.status.set(s);
    this.page.set(1);
  }
  next(): void { if (this.data()?.hasNext) this.page.update((p) => p + 1); }
  prev(): void { if (this.data()?.hasPrevious) this.page.update((p) => p - 1); }

  /** Confirm is blocked in the API until a prescription-only order has an approved prescription. */
  canConfirm(o: OrderResponse): boolean {
    return o.status === 'Pending' && (!o.requiresPrescription || o.prescriptionStatus === 'Approved');
  }

  confirm(o: OrderResponse): void {
    this.run(o, this.orderService.confirm(o.id));
  }

  cancel(o: OrderResponse): void {
    if (!confirm(`Cancel order #${o.id}? The patient will be notified.`)) return;
    this.run(o, this.orderService.cancel(o.id));
  }

  private run(o: OrderResponse, call: Observable<OrderResponse>): void {
    this.busyId.set(o.id);
    this.actionError.set(null);
    call.subscribe({
      next: () => {
        this.busyId.set(null);
        this.orders.reload(); // the order may now belong to a different status filter
      },
      error: (err) => {
        this.busyId.set(null);
        this.actionError.set(problemMessage(err));
        this.orders.reload();
      },
    });
  }
}