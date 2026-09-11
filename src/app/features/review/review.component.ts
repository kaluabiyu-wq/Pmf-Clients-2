import { DecimalPipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ReviewService } from '../../services/review.service';
import { ReviewResponse } from '../../model/review.model';

@Component({
  selector: 'app-review',
  standalone: true,
  imports: [FormsModule, RouterLink, DecimalPipe],
  templateUrl: './review.component.html',
  styleUrl: './review.component.scss',
})
export class ReviewComponent implements OnInit {
  private readonly reviewService = inject(ReviewService);
  private readonly route = inject(ActivatedRoute);

  pharmacyId!: number;

  reviews = signal<ReviewResponse[]>([]);
  totalCount = signal(0);
  page = signal(1);
  readonly pageSize = 10;

  averageRating = signal<number | null>(null);

  loading = signal(false);
  error = signal('');

  
  newUserId: number | null = null;
  newRating = 5;
  newComment = '';
  submitting = signal(false);
  submitError = signal('');

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount() / this.pageSize));
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
      .getByPharmacy(this.pharmacyId, { page: this.page(), pageSize: this.pageSize })
      .subscribe({
        next: (data) => {
          this.reviews.set(data.items ?? []);
          this.totalCount.set(data.totalCount ?? 0);
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

  refresh(): void {
    this.loadAverageRating();
    this.loadReviews();
  }

  nextPage(): void {
    if (this.page() < this.totalPages) {
      this.page.update((p) => p + 1);
      this.loadReviews();
    }
  }

  previousPage(): void {
    if (this.page() > 1) {
      this.page.update((p) => p - 1);
      this.loadReviews();
    }
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

           this.page.set(1);
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