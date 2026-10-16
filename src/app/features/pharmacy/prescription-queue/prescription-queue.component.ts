import { DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import {
  MAX_REVIEW_NOTE_LENGTH,
  PrescriptionPage,
  PrescriptionResponse,
  PrescriptionReviewRequest,
  VerificationStatus,
} from '../../../model/prescription.model';
import { AuthService } from '../../../services/auth-service.service';
import { PrescriptionService } from '../../../services/prescription.service';
import { problemMessage } from '../../../services/problem-message.service';

/** Pharmacy staff queue: open the patient's file, then approve or reject (with a reason). */
@Component({
  selector: 'app-prescription-queue',
  imports: [DatePipe, LowerCasePipe, RouterLink],
  templateUrl: './prescription-queue.component.html',
  styleUrls: ['../../auth/orders-shared.scss', './prescription-queue.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionQueueComponent {
  private readonly auth = inject(AuthService);
  private readonly service = inject(PrescriptionService);

  readonly statuses: (VerificationStatus | null)[] = ['Pending', 'Approved', 'Rejected', null];
  readonly status = signal<VerificationStatus | null>('Pending');
  readonly page = signal(1);
  readonly pageSize = 10;

  readonly maxNote = MAX_REVIEW_NOTE_LENGTH;
  readonly busyId = signal<number | null>(null);
  readonly rejectingId = signal<number | null>(null);
  readonly rejectNote = signal('');
  readonly noteTouched = signal(false);
  readonly actionError = signal<string | null>(null);
  readonly notice = signal<string | null>(null);

  readonly noteError = computed(() =>
    this.rejectNote().trim() ? null : 'Tell the patient why the prescription was rejected.',
  );

  readonly prescriptions = rxResource({
    params: () => {
      const pharmacyId = this.auth.pharmacyId();
      if (pharmacyId === null) return undefined; // idle until we know the pharmacy
      return { pharmacyId, status: this.status(), page: this.page() };
    },
    stream: ({ params }) =>
      this.service.getByPharmacy(params.pharmacyId, {
        status: params.status ?? undefined,
        page: params.page,
        pageSize: this.pageSize,
      }),
  });

  // Keep the previous page on screen while the next one loads.
  readonly data = linkedSignal<PrescriptionPage | undefined, PrescriptionPage | undefined>({
    source: () => this.prescriptions.value(),
    computation: (current, previous) => current ?? previous?.value,
  });
  readonly rows = computed(() => this.data()?.items ?? []);

  setStatus(s: VerificationStatus | null): void {
    this.status.set(s);
    this.page.set(1);
    this.cancelReject();
  }
  next(): void { if (this.data()?.hasNext) this.page.update((p) => p + 1); }
  prev(): void { if (this.data()?.hasPrevious) this.page.update((p) => p - 1); }

  approve(p: PrescriptionResponse): void {
    if (!confirm(`Approve the prescription for order #${p.orderId}? This decision is final.`)) return;
    this.review(p, { verificationStatus: 'Approved' }, `Approved. You can now confirm order #${p.orderId} in Orders.`);
  }

  startReject(p: PrescriptionResponse): void {
    this.rejectingId.set(p.id);
    this.rejectNote.set('');
    this.noteTouched.set(false);
  }

  cancelReject(): void {
    this.rejectingId.set(null);
    this.rejectNote.set('');
    this.noteTouched.set(false);
  }

  confirmReject(p: PrescriptionResponse): void {
    this.noteTouched.set(true);
    if (this.noteError()) return;
    this.review(
      p,
      { verificationStatus: 'Rejected', note: this.rejectNote().trim() },
      `Rejected. The patient was notified and can submit a new prescription for order #${p.orderId}.`,
    );
  }

  private review(p: PrescriptionResponse, request: PrescriptionReviewRequest, successNotice: string): void {
    this.busyId.set(p.id);
    this.actionError.set(null);
    this.notice.set(null);
    this.service.review(p.id, request).subscribe({
      next: () => {
        this.busyId.set(null);
        this.cancelReject();
        this.notice.set(successNotice);
        this.prescriptions.reload(); // it now belongs to a different status filter
      },
      error: (err) => {
        this.busyId.set(null);
        this.actionError.set(problemMessage(err));
        this.prescriptions.reload(); // 409s mean someone else decided it first
      },
    });
  }
}
