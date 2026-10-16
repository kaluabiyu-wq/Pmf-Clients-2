import { DatePipe, LowerCasePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { OrderResponse } from '../../model/order.model';
import { MAX_FILE_URL_LENGTH, PrescriptionResponse } from '../../model/prescription.model';
import { PrescriptionService } from '../../services/prescription.service';
import { problemMessage } from '../../services/problem-message.service';


@Component({
  selector: 'app-prescription-panel',
  imports: [DatePipe, LowerCasePipe],
  templateUrl: './prescription-panel.componenet.html',
  styleUrls: ['../../features/auth/orders-shared.scss', './prescription-panel.componenet.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PrescriptionPanelComponent {
  private readonly service = inject(PrescriptionService);

  readonly order = input.required<OrderResponse>();
  /** Fires after a successful submit so the parent can refresh the order. */
  readonly submitted = output<PrescriptionResponse>();

  readonly maxLength = MAX_FILE_URL_LENGTH;
  readonly fileUrl = signal('');
  readonly touched = signal(false);
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

  readonly urlError = computed<string | null>(() => {
    const value = this.fileUrl().trim();
    if (!value) return 'Enter the link to your prescription.';
    if (value.length > MAX_FILE_URL_LENGTH) return `The link must be at most ${MAX_FILE_URL_LENGTH} characters.`;
    try {
      const { protocol } = new URL(value);
      if (protocol !== 'http:' && protocol !== 'https:') return 'The link must start with http:// or https://';
    } catch {
      return 'That does not look like a valid link.';
    }
    return null;
  });

  onSubmit(event: Event): void {
    event.preventDefault();
    this.touched.set(true);
    if (this.urlError() || this.saving()) return;

    this.saving.set(true);
    this.error.set(null);
    this.service.submit(this.order().id, { fileUrl: this.fileUrl().trim() }).subscribe({
      next: (prescription) => {
        this.fileUrl.set('');
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
}
