import { CurrencyPipe, DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { OrderPage, OrderResponse, OrderStatus } from '../../../model/order.model';
import { OrderService } from '../../../services/order.service';

/** The patient's own orders, newest first. Each card links to the detail page where actions live. */
@Component({
  imports: [CurrencyPipe, DatePipe, LowerCasePipe, RouterLink],
  selector: 'app-orders',
  styleUrls: ['../../auth/orders-shared.scss', './orders.componenet.scss'],
  templateUrl: './orders.componenet.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrdersComponenet {
  private readonly orderService = inject(OrderService);

  readonly statuses: (OrderStatus | null)[] = [null, 'Pending', 'Confirmed', 'Cancelled'];
  readonly status = signal<OrderStatus | null>(null);
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly orders = rxResource({
    params: () => ({ status: this.status(), page: this.page() }),
    stream: ({ params }) =>
      this.orderService.getMine({
        status: params.status ?? undefined,
        page: params.page,
        pageSize: this.pageSize,
      }),
  });

  // Keep the previous page on screen while the next one loads.
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

  /** "Paracetamol, Amoxicillin +2 more" — enough to recognise the order without opening it. */
  itemsSummary(o: OrderResponse): string {
    const names = o.items.map((i) => i.genericName);
    const shown = names.slice(0, 2).join(', ');
    return names.length > 2 ? `${shown} +${names.length - 2} more` : shown;
  }

  /** The patient still has to upload (or re-upload) a prescription for this order. */
  needsPrescription(o: OrderResponse): boolean {
    return (
      o.status === 'Pending' &&
      o.requiresPrescription &&
      (o.prescriptionStatus === null || o.prescriptionStatus === 'Rejected')
    );
  }

  /** One line about the prescription, or null when the order doesn't need one. */
  prescriptionNote(o: OrderResponse): string | null {
    if (!o.requiresPrescription) return null;
    switch (o.prescriptionStatus) {
      case 'Approved': return 'Prescription approved.';
      case 'Pending': return 'Prescription submitted — waiting for the pharmacy to review it.';
      case 'Rejected': return o.status === 'Pending'
        ? 'Prescription rejected — upload a new one.'
        : 'Prescription was rejected.';
      default: return o.status === 'Pending' ? 'Prescription required — upload it to continue.' : null;
    }
  }
}
