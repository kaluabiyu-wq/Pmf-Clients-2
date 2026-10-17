import { Component, computed, inject, input, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { Observable } from 'rxjs';

import { AuthService } from '../../../services/auth-service.service';
import { UserFeedbackService } from '../../../services/user-feedback.service';
import { PagedFeedbackQuery } from '../../../model/userFeedback.model';

type FeedbackPage = ReturnType<UserFeedbackService['getByPharmacy']> extends Observable<infer T>
  ? T
  : never;

@Component({
  selector: 'app-user-feedback-list',
  imports: [MatPaginatorModule, MatSortModule],
  templateUrl: './user-feedback-list.component.html',
  styleUrl: './user-feedback-list.component.scss',
})
export class UserFeedbackListComponent {
  private readonly auth = inject(AuthService);
  private readonly feedbackService = inject(UserFeedbackService);

  // Set by the PharmacyAdmin pharmacy picker; null for a pharmacy owner, who is scoped to their own pharmacy.
  readonly pharmacyId = input<number | null>(null);
  readonly activePharmacyId = computed(() => this.pharmacyId() ?? this.auth.pharmacyId());

  // Paging and sorting state. Changing any of these re-runs the request below.
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly orderBy = signal<NonNullable<PagedFeedbackQuery['orderBy']>>('SubmittedAt');
  readonly descending = signal(true);

  // One request per page, scoped to the signed-in pharmacy. Stays idle while pharmacyId is null.
  readonly feedback = rxResource({
    params: () => {
      const pharmacyId = this.activePharmacyId();
      if (pharmacyId === null) return undefined;
      return {
        pharmacyId,
        page: this.pageIndex() + 1,
        pageSize: this.pageSize(),
        orderBy: this.orderBy(),
        descending: this.descending(),
      };
    },
    stream: ({ params }) =>
      this.feedbackService.getByPharmacy(params.pharmacyId, {
        page: params.page,
        pageSize: params.pageSize,
        orderBy: params.orderBy,
        descending: params.descending,
      }),
  });

  // While a new page is loading, the resource's value is empty. This keeps the previous page
  // on screen so the sort toolbar and paginator are not destroyed and rebuilt on every click.
  readonly page = linkedSignal<FeedbackPage | undefined, FeedbackPage | undefined>({
    source: () => this.feedback.value(),
    computation: (current, previous) => current ?? previous?.value,
  });

  readonly rows = computed(() => this.page()?.items ?? []);
  readonly total = computed(() => this.page()?.totalCount ?? 0);

  readonly errorMessage = computed(() => {
    const raw: any = this.feedback.error();
    if (!raw) return '';
    const e = raw.cause ?? raw; // rxResource wraps non-Error throwables such as HttpErrorResponse
    return e?.error?.detail || e?.error?.message || 'Failed to load user feedback.';
  });

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSort(sort: Sort): void {
    this.orderBy.set(
      sort.active === 'medicineName'
        ? 'MedicineName'
        : sort.active === 'wasMedicineAvailable'
          ? 'WasMedicineAvailable'
          : 'SubmittedAt',
    );
    this.descending.set(sort.direction !== 'asc');
    this.pageIndex.set(0);
  }

  refresh(): void {
    this.feedback.reload();
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString();
  }
}