import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { UserFeedbackService } from '../../services/user-feedback.service';
import { UserFeedbackResponse } from '../../model/userFeedback.model';


@Component({
  selector: 'app-user-feedback',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './user-feedback.component.html',
  styleUrl: './user-feedback.component.scss',
})
export class UserFeedbackComponent implements OnInit {
  private readonly userFeedbackService = inject(UserFeedbackService);
  private readonly route = inject(ActivatedRoute);

  pharmacyId!: number;
  inventoryId!: number;
  routeError = signal('');

  newUserId: number | null = null;
  wasMedicineAvailable = true;
  newComments = '';

  existingFeedback = signal<UserFeedbackResponse | null>(null);

  checking = signal(false);
  checkError = signal('');

  submitting = signal(false);
  submitError = signal('');

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const pharmacyId = Number(params.get('pharmacyId'));
      const inventoryId = Number(params.get('id'));

      if (!pharmacyId || !inventoryId) {
        this.routeError.set('Invalid pharmacy or inventory ID.');
        return;
      }

      this.pharmacyId = pharmacyId;
      this.inventoryId = inventoryId;
    });
  }

  
  checkExistingFeedback(): void {
    if (!this.newUserId) {
      this.checkError.set('Enter your user ID first.');
      return;
    }

    this.checking.set(true);
    this.checkError.set('');
    this.existingFeedback.set(null);

    this.userFeedbackService
      .getByUserAndInventory(this.newUserId, this.inventoryId)
      .subscribe({
        next: (data) => {
          this.existingFeedback.set(data);
          this.wasMedicineAvailable = data.wasMedicineAvailable;
          this.newComments = data.comments ?? '';
          this.checking.set(false);
        },

        error: (error: HttpErrorResponse) => {
          this.checking.set(false);

          if (error.status === 404) {
            this.existingFeedback.set(null);
            return;
          }

          console.error('Failed to check existing feedback:', error);

          this.checkError.set(
            error?.error?.detail || error?.error?.message || 'Failed to check existing feedback.'
          );
        },
      });
  }

 
  submitFeedback(): void {
    if (!this.newUserId) {
      this.submitError.set('Enter your user ID first.');
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    this.userFeedbackService
      .create(this.newUserId, {
        userId: this.newUserId,
        inventoryId: this.inventoryId,
        pharmacyId: this.pharmacyId,
        wasMedicineAvailable: this.wasMedicineAvailable,
        comments: this.newComments.trim() || null,
      })
      .subscribe({
        next: (result) => {
          this.existingFeedback.set(result);
          this.submitting.set(false);
        },

        error: (error: HttpErrorResponse) => {
          console.error('Failed to submit feedback:', error);

          this.submitError.set(
            error?.error?.detail || error?.error?.message || 'Failed to submit your feedback.'
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