import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { InventoryService } from '../../../services/inventory.service';
import { AlertService } from '../../../services/alert.service';
import { ApprovalStatus, InventorySubmission } from '../../../model/inventory.model';

type Filter = ApprovalStatus | 'all';


@Component({
  selector: 'app-inventory-approvals',
  standalone: true,
  imports: [DecimalPipe, DatePipe],
  templateUrl: './inventory-approvals.component.html',
  styleUrl: './inventory-approvals.component.scss',
})
export class InventoryApprovalsComponent {
  private readonly inventoryService = inject(InventoryService);
  private readonly alerts = inject(AlertService);

  readonly filters: { value: Filter; label: string }[] = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'all', label: 'All' },
  ];

  readonly filter = signal<Filter>('Pending');

  readonly submissions = rxResource({
    params: () => this.filter(),
    stream: ({ params: status }) => this.inventoryService.getSubmissions(status),
  });

  readonly errorMessage = computed(() => {
    const raw: any = this.submissions.error();
    if (!raw) return '';
    const e = raw.cause ?? raw;
    return e?.error?.detail || e?.error?.message || 'Failed to load submissions.';
  });

  
  readonly busyId = signal<number | null>(null);
  readonly rejectingId = signal<number | null>(null);
  readonly rejectReason = signal('');
  readonly reasonError = signal(false);

  setFilter(value: Filter): void {
    this.filter.set(value);
    this.cancelReject();
  }

  refresh(): void {
    this.submissions.reload();
  }

  approve(row: InventorySubmission): void {
    this.busyId.set(row.id);
    this.inventoryService.approve(row.id).subscribe({
      next: () => {
        this.busyId.set(null);
        this.alerts.success(`${row.genericName} at ${row.pharmacyName} was approved.`);
        this.submissions.reload();
      },
      error: (err) => this.fail(err, 'Could not approve this submission.'),
    });
  }

  startReject(row: InventorySubmission): void {
    this.rejectingId.set(row.id);
    this.rejectReason.set('');
    this.reasonError.set(false);
  }

  cancelReject(): void {
    this.rejectingId.set(null);
    this.rejectReason.set('');
    this.reasonError.set(false);
  }

  onReasonInput(event: Event): void {
    this.rejectReason.set((event.target as HTMLTextAreaElement).value);
    this.reasonError.set(false);
  }

  confirmReject(row: InventorySubmission): void {
    const reason = this.rejectReason().trim();
    if (!reason) {
      this.reasonError.set(true);
      return;
    }

    this.busyId.set(row.id);
    this.inventoryService.reject(row.id, reason).subscribe({
      next: () => {
        this.busyId.set(null);
        this.cancelReject();
        this.alerts.success(`${row.genericName} at ${row.pharmacyName} was rejected.`);
        this.submissions.reload();
      },
      error: (err) => this.fail(err, 'Could not reject this submission.'),
    });
  }

  statusClass(status: ApprovalStatus): string {
    switch (status) {
      case 'Approved':
        return 'status-approved';
      case 'Rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  }

  private fail(err: any, fallback: string): void {
    this.busyId.set(null);
    const message = err?.error?.detail || err?.error?.title || fallback;
    this.alerts.error(message);
    if (err?.status === 409) this.submissions.reload();
    console.error(err);
  }
}
