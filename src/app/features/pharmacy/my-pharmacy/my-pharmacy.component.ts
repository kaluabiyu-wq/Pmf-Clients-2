import { DatePipe } from '@angular/common';
import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, EMPTY, interval, of, startWith, switchMap } from 'rxjs';

import { Location as PmfLocation } from '../../../model/location.model';
import { DocumentType, PharmacyDocumentResponse } from '../../../model/Pharmacy-document.model';
import { PharmacyUpdateRequest } from '../../../model/pharmacy-admin-manage.model';
import { AlertService } from '../../../services/alert.service';
import { AuthService } from '../../../services/auth-service.service';
import { LocationService } from '../../../services/location.service';
import { PharmacyAdminManageService } from '../../../services/pharmacy-admin-manage.service';
import { PharmacyDocumentService } from '../../../services/pharmacy-document.service';
import { problemMessage } from '../../../services/problem-message.service';
import { ServerAlertService } from '../../../services/serveralert.service';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // mirrors LocalFileStorage on the API
const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];
const ALERT_POLL_MS = 30_000;

@Component({
  selector: 'app-my-pharmacy',
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './my-pharmacy.component.html',
  styleUrl: './my-pharmacy.component.scss',
})
export class MyPharmacyComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly auth = inject(AuthService);
  private readonly alerts = inject(AlertService);
  private readonly manage = inject(PharmacyAdminManageService);
  private readonly documentService = inject(PharmacyDocumentService);
  private readonly serverAlerts = inject(ServerAlertService);
  private readonly locationService = inject(LocationService);

  readonly documentTypes: DocumentType[] = ['License', 'BusinessRegistration', 'PharmacistCredential'];
  readonly acceptedFiles = ALLOWED_EXTENSIONS.join(',');

  // ---------- Data (re-runs when the session's pharmacyId changes; idle while it is null) ----------

  readonly profile = rxResource({
    params: () => this.auth.pharmacyId() ?? undefined,
    stream: ({ params: pharmacyId }) => this.manage.getProfile(pharmacyId),
  });

  readonly documents = rxResource({
    params: () => this.auth.pharmacyId() ?? undefined,
    stream: ({ params: pharmacyId }) => this.documentService.getByPharmacy(pharmacyId),
  });

  readonly locations = signal<PmfLocation[]>([]);

  /** The pharmacy's location name, falling back to its id while the list is still loading. */
  readonly locationLabel = computed(() => {
    const locationId = this.profile.value()?.locationId;
    if (locationId === undefined) return '';
    const match = this.locations().find((l) => l.id === locationId);
    return match ? `${match.label} (${match.subcity}, woreda ${match.woreda})` : `Location #${locationId}`;
  });

  // ---------- Profile edit ----------

  readonly editing = signal(false);
  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(200)]],
    licenseNumber: ['', [Validators.required, Validators.maxLength(30)]],
    locationId: [0, [Validators.min(1)]],
    phoneNumber: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    email: ['', [Validators.email]],
    freshnessThreshold: [24, [Validators.required, Validators.min(0), Validators.max(100)]],
  });

  // ---------- Delete ----------

  readonly confirmingDelete = signal(false);
  readonly deleting = signal(false);
  readonly deleteConfirmation = this.fb.nonNullable.control('');

  // ---------- Documents ----------

  readonly uploadType = signal<DocumentType>('License');
  readonly uploadFile = signal<File | null>(null);
  readonly uploadExpiresAt = signal('');
  readonly uploading = signal(false);
  readonly uploadError = signal('');

  readonly openingId = signal<number | null>(null);
  readonly replacingId = signal<number | null>(null);

  /** Alert ids already shown on screen, so a 30-second poll never repeats a message. */
  private readonly announced = new Set<number>();

  constructor() {
    this.locationService.getAll({ pageSize: 50 }).subscribe({
      next: (page) => this.locations.set(page.items),
      error: () => undefined, // the page still works; the location just shows as an id
    });

    this.startAlertPolling();
  }

  // ---------- Profile ----------

  startEdit(): void {
    const p = this.profile.value();
    if (!p) return;

    this.form.reset({
      name: p.name,
      licenseNumber: p.licenseNumber,
      locationId: p.locationId,
      phoneNumber: String(p.phoneNumber ?? ''),
      email: p.email ?? '',
      freshnessThreshold: p.freshnessThreshold,
    });
    this.editing.set(true);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  /** Locations to choose from; always includes the current one so the select never shows blank. */
  readonly locationOptions = computed(() => {
    const list = this.locations();
    const currentId = this.profile.value()?.locationId;
    if (currentId !== undefined && !list.some((l) => l.id === currentId)) {
      return [{ id: currentId, label: `Current location (#${currentId})` } as PmfLocation, ...list];
    }
    return list;
  });

  saveProfile(): void {
    const pharmacyId = this.auth.pharmacyId();
    if (pharmacyId === null) return;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    // Full body: the API only changes what is sent, and an empty email clears it on purpose.
    const request: PharmacyUpdateRequest = {
      name: v.name.trim(),
      licenseNumber: v.licenseNumber.trim(),
      locationId: v.locationId,
      phoneNumber: Number(v.phoneNumber),
      email: v.email.trim(),
      freshnessThreshold: v.freshnessThreshold,
    };

    this.saving.set(true);
    this.manage.update(pharmacyId, request).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(false);
        this.alerts.success('Pharmacy information saved.');
        this.profile.reload();
      },
      error: (err) => {
        this.saving.set(false);
        this.alerts.error(problemMessage(err, 'Could not save the pharmacy information.'));
      },
    });
  }

  // ---------- Delete ----------

  startDelete(): void {
    this.deleteConfirmation.reset('');
    this.confirmingDelete.set(true);
  }

  cancelDelete(): void {
    this.confirmingDelete.set(false);
  }

  /** The delete button only unlocks once the owner has typed the pharmacy's exact name. */
  canConfirmDelete(): boolean {
    const name = this.profile.value()?.name;
    return !!name && this.deleteConfirmation.value.trim() === name;
  }

  confirmDelete(): void {
    const pharmacyId = this.auth.pharmacyId();
    if (pharmacyId === null || !this.canConfirmDelete()) return;

    this.deleting.set(true);
    this.manage.delete(pharmacyId).subscribe({
      next: () => {
        this.deleting.set(false);
        this.alerts.success('Your pharmacy was removed. Contact an administrator if this was a mistake.');
        // Every page of this area is scoped to the pharmacy that no longer exists.
        this.auth.logout();
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.deleting.set(false);
        this.alerts.error(problemMessage(err, 'Could not remove the pharmacy.'));
      },
    });
  }

  // ---------- Documents ----------

  openFile(document: PharmacyDocumentResponse): void {
    this.openingId.set(document.id);
    this.documentService.openFile(document).subscribe({
      next: () => this.openingId.set(null),
      error: (err) => {
        this.openingId.set(null);
        this.alerts.error(err instanceof Error ? err.message : 'Could not open the file.');
      },
    });
  }

  onUploadFileChosen(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;
    const problem = file ? this.fileProblem(file) : '';

    this.uploadError.set(problem);
    this.uploadFile.set(problem ? null : file);
    if (problem) input.value = '';
  }

  submitUpload(form: HTMLFormElement): void {
    const pharmacyId = this.auth.pharmacyId();
    const file = this.uploadFile();
    if (pharmacyId === null) return;
    if (!file) {
      this.uploadError.set('Choose a PDF, JPG or PNG file first.');
      return;
    }

    this.uploading.set(true);
    this.uploadError.set('');

    this.documentService
      .upload(pharmacyId, this.uploadType(), file, this.toIsoDate(this.uploadExpiresAt()))
      .subscribe({
        next: () => {
          this.uploading.set(false);
          this.uploadFile.set(null);
          this.uploadExpiresAt.set('');
          form.reset();
          this.alerts.success('Document uploaded. It is waiting for review.');
          this.documents.reload();
          this.profile.reload(); // the pending-document count changed
        },
        error: (err) => {
          this.uploading.set(false);
          this.uploadError.set(problemMessage(err, 'Could not upload the document.'));
        },
      });
  }

  onReplaceFileChosen(document: PharmacyDocumentResponse, event: Event): void {
    const pharmacyId = this.auth.pharmacyId();
    const input = event.target as HTMLInputElement;
    const file = input.files?.item(0) ?? null;
    input.value = ''; // lets the same file be picked again after a failure
    if (pharmacyId === null || !file) return;

    const problem = this.fileProblem(file);
    if (problem) {
      this.alerts.error(problem);
      return;
    }

    if (
      document.reviewStatus === 'Approved' &&
      !window.confirm(
        'This document is approved. Replacing the file sends it back to review until an administrator approves the new one. Continue?',
      )
    ) {
      return;
    }

    this.replacingId.set(document.id);
    this.documentService.replaceFile(pharmacyId, document.id, file).subscribe({
      next: () => {
        this.replacingId.set(null);
        this.alerts.success('File replaced. The document is waiting for review again.');
        this.documents.reload();
        this.profile.reload();
      },
      error: (err) => {
        this.replacingId.set(null);
        this.alerts.error(problemMessage(err, 'Could not replace the file.'));
      },
    });
  }

  statusClass(document: PharmacyDocumentResponse): string {
    switch (document.reviewStatus) {
      case 'Approved':
        return 'status--approved';
      case 'Rejected':
        return 'status--rejected';
      default:
        return 'status--pending';
    }
  }

  isExpired(expiresAt: string | null): boolean {
    return !!expiresAt && new Date(expiresAt).getTime() < Date.now();
  }

  // ---------- Notifications ----------

  /**
   * While this page is open, check for unread document alerts every 30 seconds and show each
   * once: approvals as a success message, rejections as an error message that carries the
   * reviewer's note. Shown alerts are marked read so the unread count does not keep growing.
   * The rejection note also stays on the document row, so nothing is lost once it is dismissed.
   */
  private startAlertPolling(): void {
    interval(ALERT_POLL_MS)
      .pipe(
        startWith(0),
        switchMap(() =>
          this.auth.pharmacyId() === null
            ? EMPTY
            : this.serverAlerts.getMine({ isRead: false, pageSize: 50 }).pipe(catchError(() => of(null))),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((page) => {
        if (!page) return;

        // Oldest first, so messages appear in the order things happened.
        const fresh = page.items
          .filter((a) => a.referenceTable === 'PharmacyDocuments' && !this.announced.has(a.id))
          .reverse();
        if (fresh.length === 0) return;

        for (const alert of fresh) {
          this.announced.add(alert.id);
          if (alert.eventType === 'DocumentApproved') this.alerts.success(alert.message, 8000);
          else if (alert.eventType === 'DocumentRejected') this.alerts.error(alert.message);

          this.serverAlerts.markRead(alert.id).subscribe({ error: () => undefined });
        }

        // A review just happened: bring the table (and counts) up to date.
        this.documents.reload();
        this.profile.reload();
      });
  }

  // ---------- Helpers ----------

  private fileProblem(file: File): string {
    const lower = file.name.toLowerCase();
    if (!ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext))) {
      return 'Only .pdf, .jpg, .jpeg or .png files are accepted.';
    }
    if (file.size === 0) return 'That file is empty.';
    if (file.size > MAX_FILE_BYTES) return 'The file is larger than 5 MB.';
    return '';
  }

  private toIsoDate(value: string): string | null {
    return value ? new Date(value).toISOString() : null;
  }
}