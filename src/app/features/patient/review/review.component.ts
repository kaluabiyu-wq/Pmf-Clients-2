import { DecimalPipe } from '@angular/common';
import { Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule, Sort } from '@angular/material/sort';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';

import { AuthService } from '../../../services/auth-service.service';
import { ReviewService } from '../../../services/review.service';

type ReviewPage = ReturnType<ReviewService['getByPharmacy']> extends Observable<infer T>
  ? T
  : never;

@Component({
  selector: 'app-review',
  imports: [FormsModule, RouterLink, DecimalPipe, MatPaginatorModule, MatSortModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',
})
export class ReviewComponent {
  private readonly reviewService = inject(ReviewService);
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);

  private readonly routeParams = toSignal(this.route.paramMap, {
    initialValue: this.route.snapshot.paramMap,
  });

  readonly pharmacyId = computed(() => {
    const id = Number(this.routeParams().get('pharmacyId'));
    return id > 0 ? id : null;
  });

  // The reviewer is whoever is signed in. The user id is no longer typed into the form.
  readonly userId = computed(() => this.auth.currentUser()?.id ?? null);

  // Paging and sorting state. Changing any of these re-runs the reviews request.
  readonly pageIndex = signal(0);
  readonly pageSize = signal(10);
  readonly orderBy = signal<'SubmittedAt' | 'Rating'>('SubmittedAt');
  readonly descending = signal(true);

  private readonly averageRatingResource = rxResource({
    params: () => this.pharmacyId() ?? undefined,
    stream: ({ params: pharmacyId }) => this.reviewService.getAverageRating(pharmacyId),
  });

  readonly averageRating = computed(() => this.averageRatingResource.value() ?? null);

  readonly reviewsResource = rxResource({
    params: () => {
      const pharmacyId = this.pharmacyId();
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
      this.reviewService.getByPharmacy(params.pharmacyId, {
        page: params.page,
        pageSize: params.pageSize,
        orderBy: params.orderBy,
        descending: params.descending,
      }),
  });

  // Keeps the previous page on screen while the next one loads, so the sort toolbar and
  // paginator are not destroyed and rebuilt on every click.
  readonly page = linkedSignal<ReviewPage | undefined, ReviewPage | undefined>({
    source: () => this.reviewsResource.value(),
    computation: (current, previous) => current ?? previous?.value,
  });

  readonly reviews = computed(() => this.page()?.items ?? []);
  readonly total = computed(() => this.page()?.totalCount ?? 0);

  readonly loading = computed(() => this.reviewsResource.isLoading() && !this.page());

  readonly error = computed(() => {
    if (this.pharmacyId() === null) return 'Invalid pharmacy ID.';
    const raw: any = this.reviewsResource.error();
    if (!raw) return '';
    const e = raw.cause ?? raw; // rxResource wraps non-Error throwables such as HttpErrorResponse
    return e?.error?.detail || e?.error?.message || 'Failed to load reviews.';
  });

  newRating = 5;
  newComment = '';
  submitting = signal(false);
  submitError = signal('');

  onPage(event: PageEvent): void {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
  }

  onSort(sort: Sort): void {
    this.orderBy.set(sort.active === 'rating' ? 'Rating' : 'SubmittedAt');
    this.descending.set(sort.direction !== 'asc');
    this.pageIndex.set(0);
  }

  submitReview(): void {
    const userId = this.userId();
    const pharmacyId = this.pharmacyId();

    if (!userId || pharmacyId === null) {
      this.submitError.set('Please log in to leave a review.');
      return;
    }

    const rating = Number(this.newRating);
    if (rating < 1 || rating > 5) {
      this.submitError.set('Rating must be between 1 and 5.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    this.reviewService
      .create(pharmacyId, {
        userId,
        rating,
        comment: this.newComment.trim() || null,
      })
      .subscribe({
        next: () => {
          this.newComment = '';
          this.newRating = 5;
          this.submitting.set(false);

          // Back to the first page; the sort the reader chose is left alone.
          this.pageIndex.set(0);
          this.reviewsResource.reload();
          this.averageRatingResource.reload();
        },

        error: (error) => {
          console.error('Failed to submit review:', error);

          this.submitError.set(
            error?.status === 401
              ? 'Your session has expired. Please log in again.'
              : error?.error?.detail ||
                  error?.error?.message ||
                  'Failed to submit your review.',
          );

          this.submitting.set(false);
        },
      });
  }

  formatDate(date: string | undefined): string {
    if (!date) {
      return '-';
    }

    return new Date(date).toLocaleString();
  }
}