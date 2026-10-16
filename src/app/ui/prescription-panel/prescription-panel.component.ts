import { DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { OrderResponse } from '../../model/order.model';
import {
  PRESCRIPTION_ACCEPT,
  PrescriptionResponse,
  prescriptionFileError,
} from '../../model/prescription.model';
import { PrescriptionService } from '../../services/prescription.service';
import { problemMessage } from '../../services/problem-message.service';


/**
 * Patient-side prescription box for one order: shows every attempt (with the pharmacy's
 * rejection notes), lets the patient upload a photo/PDF when the API would accept one, and opens
 * stored files through the authenticated download endpoint.
 */
@Component({
  selector: 'app-prescription-panel',
  imports: [DatePipe, LowerCasePipe],
  templateUrl: './prescription-panel.component.html',
  styleUrls: ['../../features/auth/orders-shared.scss', './prescription-panel.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionPanelComponent {
  private readonly service = inject(PrescriptionService);

  readonly order = input.required<OrderResponse>();
  /** Fires after a successful submit so the parent can refresh the order. */
  readonly submitted = output<PrescriptionResponse>();

  readonly accept = PRESCRIPTION_ACCEPT;
  private readonly fileInput = viewChild<ElementRef<HTMLInputElement>>('fileInput');
  readonly file = signal<File | null>(null);
  readonly touched = signal(false);
  readonly openingId = signal<number | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  readonly history = rxResource({
    params: () => this.order().id,
    stream: ({ params }) => this.service.getByOrder(params),
  });

  readonly latest = computed(() => this.history.value()?.[0] ?? null);

  /** Mirrors the API rules: Pending order, Rx medicine, and nothing pending/approved yet. */
  readonly canSubmit = computed(() => {
    const o = this.order();
    return (
      o.status === 'Pending' &&
      o.requiresPrescription &&
      (!o.prescriptionStatus || o.prescriptionStatus === 'Rejected')
    );
  });

  readonly fileError = computed<string | null>(() => prescriptionFileError(this.file()));

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.file.set(input.files?.item(0) ?? null);
    this.touched.set(true);
    this.error.set(null);
  }

  onSubmit(event: Event): void {
    event.preventDefault();
    this.touched.set(true);
    const file = this.file();
    if (this.fileError() || !file || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);
    this.service.upload(this.order().id, file).subscribe({
      next: (prescription) => {
        this.file.set(null);
        const input = this.fileInput();
        if (input) input.nativeElement.value = '';
        this.touched.set(false);
        this.saving.set(false);
        this.history.reload();
        this.submitted.emit(prescription);
      },
      error: (err) => {
        this.error.set(problemMessage(err));
        this.saving.set(false);
        this.history.reload(); // a 409 usually means the state changed under us
      },
    });
  }

  /** Uploads sit behind the API's auth, so they're fetched with the token rather than linked. */
  open(p: PrescriptionResponse): void {
    if (this.openingId() !== null) return;
    this.openingId.set(p.id);
    this.error.set(null);
    this.service.openFile(p).subscribe({
      next: () => this.openingId.set(null),
      error: (err) => {
        this.openingId.set(null);
        this.error.set(err?.status === 404 ? 'That prescription file is no longer available.' : problemMessage(err));
      },
    });
  }
}
