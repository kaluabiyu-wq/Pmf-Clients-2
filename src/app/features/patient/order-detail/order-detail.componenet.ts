import { CurrencyPipe, DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { OrderResponse } from '../../../model/order.model';
import { OrderService } from '../../../services/order.service';
import { problemMessage } from '../../../services/problem-message.service';
import { PrescriptionPanelComponent } from '../../../ui/prescription-panel/prescription-panel.componenet';

@Component({
  selector: 'app-order-detail',
  imports: [CurrencyPipe, DatePipe, LowerCasePipe, RouterLink, PrescriptionPanelComponent],
  templateUrl: './order-detail.componenet.html',
  styleUrl: '../../auth/orders-shared.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetailComponent {
  private readonly orderService = inject(OrderService);

  /** Bound from the :id route param (withComponentInputBinding is on). */
  readonly id = input.required<string>();

  private readonly resource = rxResource({
    params: () => Number(this.id()),
    stream: ({ params }) => this.orderService.getById(params),
  });

  /** Starts as the loaded order, then is replaced by whatever each action returns. */
  readonly order = linkedSignal<OrderResponse | undefined>(() => this.resource.value());

  readonly busy = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly isPending = computed(() => this.order()?.status === 'Pending');
  readonly canRemove = computed(() => this.isPending() && (this.order()?.items.length ?? 0) > 1);
  readonly loadError = computed(() => (this.resource.error() ? 'Could not load this order.' : null));

  /** Called after a prescription is submitted: the order's prescriptionStatus changed. */
  reloadOrder(): void {
    this.resource.reload();
  }

  changeQuantity(itemId: number, raw: string): void {
    const quantity = Math.min(100, Math.max(1, Math.floor(Number(raw)) || 1));
    const order = this.order();
    if (!order) return;
    this.run(this.orderService.updateItemQuantity(order.id, itemId, quantity));
  }

  removeItem(itemId: number): void {
    const order = this.order();
    if (!order) return;
    this.run(this.orderService.removeItem(order.id, itemId));
  }

  cancelOrder(): void {
    const order = this.order();
    if (!order || !confirm(`Cancel order #${order.id}? This cannot be undone.`)) return;
    this.run(this.orderService.cancel(order.id));
  }

  private run(call: Observable<OrderResponse>): void {
    this.busy.set(true);
    this.actionError.set(null);
    call.subscribe({
      next: (updated) => {
        this.order.set(updated);
        this.busy.set(false);
      },
      error: (err) => {
        this.actionError.set(problemMessage(err));
        this.busy.set(false);
        this.resource.reload(); // 409s usually mean the order changed under us
      },
    });
  }
}
