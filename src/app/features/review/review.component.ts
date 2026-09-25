import { DecimalPipe } from '@angular/common';
import { Component, OnInit, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ReviewService } from '../../services/review.service';
import { ReviewResponse } from '../../model/review.model';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe,MatPaginator,MatSortModule],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',
})
export class ReviewComponent implements OnInit {
  private readonly reviewService = inject(ReviewService);
  private readonly route = inject(ActivatedRoute);

  pharmacyId!: number;

  reviews = signal<ReviewResponse[]>([]);
  readonly reviewsDataSource = new MatTableDataSource<ReviewResponse>([]);

  readonly paginator = viewChild.required(MatPaginator);
  readonly sort = viewChild.required(MatSort);

  readonly pagedReviews = toSignal(this.reviewsDataSource.connect(), {
    initialValue: [] as ReviewResponse[],
  });


  averageRating = signal<number | null>(null);

  loading = signal(false);
  error = signal('');

  
  newUserId: number | null = null;
  newRating = 5;
  newComment = '';
  submitting = signal(false);
  submitError = signal('');

  constructor() {
    this.reviewsDataSource.sortingDataAccessor = (item, property) => {
      switch (property) {
        case 'rating':
          return item.rating ?? 0;
        case 'userId':
          return item.userId ?? 0;
        case 'submittedAt':
          return item.submittedAt ? new Date(item.submittedAt).getTime() : 0;
        default:
          return '';
      }
    };

    effect(() => {
      this.reviewsDataSource.data = this.reviews();
    });

    effect(() => {
      this.reviewsDataSource.paginator = this.paginator();
      this.reviewsDataSource.sort = this.sort();
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
      this.loadAverageRating();
      this.loadReviews();
    });
  }

  loadReviews(): void {
    this.loading.set(true);
    this.error.set('');

    this.reviewService
      .getByPharmacy(this.pharmacyId, { page: 1, pageSize: 1000 })
      .subscribe({
        next: (data) => {
          this.reviews.set(data.items ?? []);
          this.loading.set(false);
        },

        error: (error) => {
          console.error('Failed to load reviews:', error);

          this.error.set(
            error?.error?.detail || error?.error?.message || 'Failed to load reviews.'
          );

          this.loading.set(false);
        },
      });
  }

  loadAverageRating(): void {
    this.reviewService.getAverageRating(this.pharmacyId).subscribe({
      next: (average) => this.averageRating.set(average),
      error: (error) => console.error('Failed to load average rating:', error),
    });
  }


  submitReview(): void {
    if (!this.newUserId) {
      this.submitError.set('Enter your user ID first.');
      return;
    }

    if (this.newRating < 1 || this.newRating > 5) {
      this.submitError.set('Rating must be between 1 and 5.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    this.reviewService
      .create(this.pharmacyId, {
        userId: this.newUserId,
        rating: this.newRating,
        comment: this.newComment.trim() || null,
      })
      .subscribe({
        next: () => {
          this.newComment = '';
          this.newRating = 5;
          this.submitting.set(false);

          this.loadAverageRating();
          this.loadReviews();
        },

        error: (error) => {
          console.error('Failed to submit review:', error);

          this.submitError.set(
            error?.error?.detail ||
              error?.error?.message ||
              'Failed to submit your review.'
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