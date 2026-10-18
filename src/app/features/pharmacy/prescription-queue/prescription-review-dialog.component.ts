import { CurrencyPipe, DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable, map, of } from 'rxjs';
import {
  MAX_REVIEW_NOTE_LENGTH,
  PrescriptionResponse,
  VerificationStatus,
  isPrescriptionLink,
} from '../../../model/prescription.model';
import { OrderService } from '../../../services/order.service';
import { PrescriptionService } from '../../../services/prescription.service';
import { problemMessage } from '../../../services/problem-message.service';

export interface PrescriptionReviewResult {
  decision: Extract<VerificationStatus, 'Approved' | 'Rejected'>;
  orderId: number;
}

interface FileView {
  kind: 'image' | 'pdf' | 'link' | 'other';
  /** blob: URL for files stored by the API; null for old link submissions. */
  objectUrl: string | null;
  link: string | null;
}

/** Review dialog: the patient's file next to the order, with Approve / Reject (reason required). */
@Component({
  selector: 'app-prescription-review-dialog',
  imports: [CurrencyPipe, DatePipe, LowerCasePipe, MatDialogModule],
  templateUrl: './prescription-review-dialog.component.html',
  styleUrls: ['../../auth/orders-shared.scss', './prescription-review-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionReviewDialogComponent {
  private readonly dialogRef =
    inject<MatDialogRef<PrescriptionReviewDialogComponent, PrescriptionReviewResult>>(MatDialogRef);
  private readonly service = inject(PrescriptionService);
  private readonly orderService = inject(OrderService);
  private readonly sanitizer = inject(DomSanitizer);

  readonly prescription = inject<PrescriptionResponse>(MAT_DIALOG_DATA);
  readonly isPending = this.prescription.verificationStatus === 'Pending';
  readonly maxNote = MAX_REVIEW_NOTE_LENGTH;

  readonly rejecting = signal(false);
  readonly note = signal('');
  readonly noteTouched = signal(false);
  readonly busy = signal(false);
  readonly actionError = signal<string | null>(null);

  readonly noteError = computed(() =>
    this.note().trim() ? null : 'Tell the patient why the prescription was rejected.',
  );

  readonly order = rxResource({
    params: () => this.prescription.orderId,
    stream: ({ params: orderId }) => this.orderService.getById(orderId),
  });

  readonly file = rxResource({
    params: () => this.prescription.id,
    stream: () => this.loadFile(),
  });

  readonly pdfUrl = computed<SafeResourceUrl | null>(() => {
    if (!this.file.hasValue()) return null;
    const view = this.file.value();
    return view.kind === 'pdf' && view.objectUrl
      ? this.sanitizer.bypassSecurityTrustResourceUrl(view.objectUrl)
      : null;
  });

  private objectUrl: string | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.releaseObjectUrl());
  }

  approve(): void {
    if (!confirm(`Approve the prescription for order #${this.prescription.orderId}? This decision is final.`)) return;
    this.submit('Approved', '');
  }

  startReject(): void {
    this.rejecting.set(true);
    this.note.set('');
    this.noteTouched.set(false);
    this.actionError.set(null);
  }

  cancelReject(): void {
    this.rejecting.set(false);
    this.note.set('');
    this.noteTouched.set(false);
  }

  confirmReject(): void {
    this.noteTouched.set(true);
    if (this.noteError()) return;
    this.submit('Rejected', this.note().trim());
  }

  private submit(decision: PrescriptionReviewResult['decision'], note: string): void {
    this.busy.set(true);
    this.actionError.set(null);
    this.service
      .review(this.prescription.id, note ? { verificationStatus: decision, note } : { verificationStatus: decision })
      .subscribe({
        next: () => this.dialogRef.close({ decision, orderId: this.prescription.orderId }),
        error: (err) => {
          this.busy.set(false);
          this.actionError.set(problemMessage(err));
        },
      });
  }

  private loadFile(): Observable<FileView> {
    const { id, fileUrl } = this.prescription;
    if (isPrescriptionLink(fileUrl)) {
      return of({ kind: 'link', objectUrl: null, link: fileUrl });
    }

    return this.service.getFile(id).pipe(
      map((blob): FileView => {
        this.releaseObjectUrl();
        this.objectUrl = URL.createObjectURL(blob);
        const kind = blob.type.startsWith('image/') ? 'image' : blob.type === 'application/pdf' ? 'pdf' : 'other';
        return { kind, objectUrl: this.objectUrl, link: null };
      }),
    );
  }

  private releaseObjectUrl(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = null;
    }
  }
}