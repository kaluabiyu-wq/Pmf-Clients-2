import { DatePipe } from '@angular/common';
import { Component, OnInit, computed, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { toSignal } from '@angular/core/rxjs-interop';

import { PharmacyDocumentService } from '../../../services/pharmacy-document.service';
import { AuthService } from '../../../services/auth-service.service';
import { ServerAlertService  } from '../../../services/serveralert.service';
import {
  DocumentType,
  PharmacyDocumentResponse,
  ReviewStatus,
} from '../../../model/Pharmacy-document.model';

@Component({
  selector: 'app-pharmacy-document',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, MatPaginator, MatSortModule],
  templateUrl: './pharmacy-document.componenet.html',
  styleUrl: './pharmacy-document.componenet.scss',
})
export class PharmacyDocumentComponenet implements OnInit {
  private readonly pharmacyDocumentService = inject(PharmacyDocumentService);
  private readonly route = inject(ActivatedRoute);
  private readonly serverAlerts = inject(ServerAlertService);
  private readonly auth = inject(AuthService);

  /** Only platform admins review; the API enforces this too (SystemAdmin policy). */
  readonly canReview = computed(() => this.auth.hasRole('PharmacyAdmin', 'SysAdmin'));

  pharmacyId!: number;

  documents = signal<PharmacyDocumentResponse[]>([]);
  readonly documentsDataSource = new MatTableDataSource<PharmacyDocumentResponse>([]);

  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  readonly pagedDocuments = toSignal(this.documentsDataSource.connect(), {
    initialValue: [] as PharmacyDocumentResponse[],
  });

  loading = signal(false);
  error = signal('');

  
  newDocumentType: DocumentType = 'License';
  newFileUrl = '';
  newExpiresAt = '';
  submitting = signal(false);
  submitError = signal('');

  
  reviewingId = signal<number | null>(null);
  reviewError = signal('');
  /** Why a document is being rejected; sent to the pharmacy's staff. */
  reviewReason = '';

  /** Open a stored file in a new tab. */
  openingFileId = signal<number | null>(null);
  fileError = signal('');

  /** documentId -> the message the admin sent when rejecting it (from the user's alerts). */
  rejectionMessages = signal<Record<number, string>>({});

  readonly documentTypes: DocumentType[] = ['License', 'BusinessRegistration', 'PharmacistCredential'];

  constructor() {
    this.documentsDataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'documentType':
          return item.documentType ?? '';
        case 'reviewStatus':
          return item.reviewStatus ?? '';
        case 'uploadedAt':
          return item.uploadedAt ? new Date(item.uploadedAt).getTime() : 0;
        case 'expiresAt':
          return item.expiresAt ? new Date(item.expiresAt).getTime() : 0;
        default:
          return '';
      }
    };

    effect(() => {
      this.documentsDataSource.data = this.documents();
    });

    effect(() => {
      this.documentsDataSource.paginator = this.paginator();
      this.documentsDataSource.sort = this.sort();
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const pharmacyId = Number(params.get('pharmacyId'));

      if (!pharmacyId) {
        this.error.set('Invalid pharmacy ID.');
        return;
      }

      this.pharmacyId = pharmacyId;
      this.loadDocuments();
    });
  }

  loadDocuments(): void {
    this.loading.set(true);
    this.error.set('');

    this.pharmacyDocumentService.getByPharmacy(this.pharmacyId).subscribe({
      next: (data) => {
        this.documents.set(data ?? []);
        this.loading.set(false);
        this.loadRejectionMessages();
      },

      error: (error) => {
        console.error('Failed to load pharmacy documents:', error);

        this.error.set(
          error?.error?.detail || error?.error?.message || 'Failed to load documents.'
        );

        this.loading.set(false);
      },
    });
  }

  refresh(): void {
    this.loadDocuments();
  }

  
  private loadRejectionMessages(): void {
    this.serverAlerts.getMine({ pageSize: 100 }).subscribe({
      next: (page) => {
        const byDocument: Record<number, string> = {};
        for (const alert of page.items) {
          if (
            alert.referenceTable === 'PharmacyDocuments' &&
            alert.eventType === 'DocumentRejected' &&
            byDocument[alert.referenceId] === undefined
          ) {
            byDocument[alert.referenceId] = alert.message;
          }
        }
        this.rejectionMessages.set(byDocument);
      },
      error: () => this.rejectionMessages.set({}),
    });
  }

  openFile(document: PharmacyDocumentResponse): void {
    this.fileError.set('');
    this.openingFileId.set(document.id);

    this.pharmacyDocumentService.openFile(document).subscribe({
      next: () => this.openingFileId.set(null),
      error: (error) => {
        console.error('Failed to open document file:', error);
        this.openingFileId.set(null);
        this.fileError.set(
          error?.status === 404
            ? 'This file is no longer available.'
            : 'Could not open the file. Please try again.',
        );
      },
    });
  }

  submitDocument(): void {
    if (!this.newFileUrl.trim()) {
      this.submitError.set('Enter a file URL first.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    this.pharmacyDocumentService
      .create(this.pharmacyId, {
        documentType: this.newDocumentType,
        fileUrl: this.newFileUrl.trim(),
        expiresAt: this.newExpiresAt ? new Date(this.newExpiresAt).toISOString() : null,
      })
      .subscribe({
        next: () => {
          this.newFileUrl = '';
          this.newExpiresAt = '';
          this.newDocumentType = 'License';
          this.submitting.set(false);

          this.loadDocuments();
        },

        error: (error) => {
          console.error('Failed to upload document:', error);

          this.submitError.set(
            error?.error?.detail || error?.error?.message || 'Failed to upload the document.'
          );

          this.submitting.set(false);
        },
      });
  }

  startReview(documentId: number): void {
    this.reviewError.set('');
    this.reviewReason = '';
    this.reviewingId.set(documentId);
  }

  cancelReview(): void {
    this.reviewingId.set(null);
    this.reviewReason = '';
    this.reviewError.set('');
  }

  submitReview(documentId: number, reviewStatus: ReviewStatus): void {
    const reviewerId = this.auth.currentUser()?.id;
    if (!reviewerId) {
      this.reviewError.set('Sign in again to review documents.');
      return;
    }

    const reason = this.reviewReason.trim();
    if (reviewStatus === 'Rejected' && !reason) {
      this.reviewError.set('Write a short message telling the pharmacy what is wrong with this file.');
      return;
    }

    this.reviewError.set('');

    this.pharmacyDocumentService
      .review(this.pharmacyId, documentId, {
        reviewedByUserId: reviewerId,
        reviewStatus,
        reason: reviewStatus === 'Rejected' ? reason : null,
      })
      .subscribe({
        next: () => {
          this.reviewingId.set(null);
          this.reviewReason = '';
          this.loadDocuments();
        },

        error: (error) => {
          console.error('Failed to review document:', error);

          this.reviewError.set(
            error?.error?.detail || error?.error?.message || 'Failed to submit the review.'
          );
        },
      });
  }

  getStatusClass(status: ReviewStatus | undefined): string {
    if (!status) {
      return 'status-default';
    }

    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
        return 'status-pending';
      default:
        return 'status-default';
    }
  }

  isExpired(expiresAt: string | null): boolean {
    if (!expiresAt) {
      return false;
    }

    return new Date(expiresAt).getTime() < Date.now();
  }
}