import { DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { OrderResponse } from '../../../model/order.model';
import {
  PrescriptionPage,
  PrescriptionResponse,
  VerificationStatus,
} from '../../../model/prescription.model';
import { AuthService } from '../../../services/auth-service.service';
import { OrderService } from '../../../services/order.service';
import { PrescriptionService } from '../../../services/prescription.service';
import { problemMessage } from '../../../services/problem-message.service';
import {
  PrescriptionReviewDialogComponent,
  PrescriptionReviewResult,
} from './prescription-review-dialog.component';

/**
 * Pharmacy staff queue as a table: see who the prescription is from, view the file,
 * then open the Review dialog to approve or reject (with a reason).
 */
@Component({
  selector: 'app-prescription-queue',
  imports: [DatePipe, LowerCasePipe, RouterLink, MatTableModule, MatPaginatorModule],
  templateUrl: './prescription-queue.component.html',
  styleUrls: ['../../auth/orders-shared.scss', './prescription-queue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionQueueComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(PrescriptionService);
  private readonly orderService = inject(OrderService);
  private readonly dialog = inject(MatDialog);

  readonly displayedColumns = ['order', 'patient', 'file', 'status', 'submitted', 'reviewedBy', 'actions'];

  readonly statuses: (VerificationStatus | null)[] = ['Pending', 'Approved', 'Rejected', null];
  readonly status = signal<VerificationStatus | null>('Pending');
  readonly page = signal(1);
  readonly pageSize = signal(10);
  readonly pageSizeOptions = [5, 10, 20];

  readonly openingId = signal<number | null>(null);
  readonly actionError = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  readonly prescriptions = rxResource({
    params: () => {
      const pharmacyId = this.auth.pharmacyId();
      if (pharmacyId === null) return undefined; // idle until we know the pharmacy
      return { pharmacyId, status: this.status(), page: this.page(), pageSize: this.pageSize() };
    },
    stream: ({ params }) =>
      this.service.getByPharmacy(params.pharmacyId, {
        status: params.status ?? undefined,
        page: params.page,
        pageSize: params.pageSize,
      }),
  });

  // Keep the previous page on screen while the next one loads (the table is dimmed and
  // non-clickable meanwhile, so old rows can't be acted on under the wrong filter).
  readonly data = linkedSignal<PrescriptionPage | undefined, PrescriptionPage | undefined>({
    source: () => this.prescriptions.value(),
    computation: (current, previous) => current ?? previous?.value,
  });
  readonly rows = computed(() => this.data()?.items ?? []);
  readonly total = computed(() => this.data()?.totalCount ?? 0);

  // The prescription list carries only an order id, so look up each order once to show who
  // the patient is. Re-runs only when the set of order ids on screen actually changes.
  private readonly orderIds = computed(() => [...new Set(this.rows().map((r) => r.orderId))], {
    equal: (a, b) => a.join(',') === b.join(','),
  });

  readonly orders = rxResource({
    params: () => (this.orderIds().length > 0 ? this.orderIds() : undefined),
    stream: ({ params: ids }) =>
      forkJoin(ids.map((id) => this.orderService.getById(id).pipe(catchError(() => of(null))))),
  });

  readonly orderById = computed(() => {
    const map = new Map<number, OrderResponse>();
    if (this.orders.hasValue()) {
      for (const order of this.orders.value()) if (order) map.set(order.id, order);
    }
    return map;
  });

  setStatus(s: VerificationStatus | null): void {
    this.status.set(s);
    this.page.set(1);
  }

  onPage(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    this.page.set(event.pageIndex + 1);
  }

  /** Uploads are behind the API's auth, so fetch with the token instead of linking. */
  open(p: PrescriptionResponse): void {
    if (this.openingId() !== null) return;
    this.openingId.set(p.id);
    this.actionError.set(null);
    this.service.openFile(p).subscribe({
      next: () => this.openingId.set(null),
      error: (err) => {
        this.openingId.set(null);
        this.actionError.set(
          err?.status === 404 ? 'That prescription file is no longer available.' : problemMessage(err),
        );
      },
    });
  }

  review(p: PrescriptionResponse): void {
    this.notice.set(null);
    this.actionError.set(null);

    this.dialog
      .open<PrescriptionReviewDialogComponent, PrescriptionResponse, PrescriptionReviewResult>(
        PrescriptionReviewDialogComponent,
        { data: p, width: '980px', maxWidth: '95vw', autoFocus: 'dialog' },
      )
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.notice.set(
            result.decision === 'Approved'
              ? `Approved. You can now confirm order #${result.orderId} in Orders.`
              : `Rejected. The patient was notified and can submit a new prescription for order #${result.orderId}.`,
          );
        }
        this.prescriptions.reload(); // it may now belong to a different status filter
      });
  }
}