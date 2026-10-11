import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../../services/auth-service.service';
import { FavoriteService } from '../../../services/favorite.service';
import { FavoriteResponse } from '../../../model/favorite.model';

@Component({
  selector: 'app-favorite',
  imports: [FormsModule, DatePipe, RouterLink],
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss',
})
export class FavoriteComponent implements OnInit {
  private readonly favoriteService = inject(FavoriteService);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  // The signed-in user's own id. It is no longer read from the URL, so nobody can open
  // /patient/favourite/<someone else's id> to view or remove another person's favourites.
  userId!: number;

  favorites = signal<FavoriteResponse[]>([]);
  loading = signal(false);
  error = signal('');

  newPharmacyId: number | null = null;
  adding = signal(false);
  addError = signal('');

  removingId = signal<number | null>(null);

  ngOnInit(): void {
    const userId = this.auth.currentUser()?.id;

    if (!userId) {
      this.error.set('Please log in to see your favorites.');
      return;
    }

    this.userId = userId;
    this.loadFavorites();
  }

  loadFavorites(): void {
    this.loading.set(true);
    this.error.set('');

    this.favoriteService.getByUser(this.userId).subscribe({
      next: (data) => {
        this.favorites.set(data ?? []);
        this.loading.set(false);
      },

      error: (error) => {
        console.error('Failed to load favorites:', error);

        this.error.set(
          error?.status === 403
            ? "You don't have access to these favorites."
            : error?.error?.detail || error?.error?.message || 'Failed to load favorites.',
        );

        this.loading.set(false);
      },
    });
  }

  refresh(): void {
    this.loadFavorites();
  }

  addFavorite(): void {
    if (!this.newPharmacyId) {
      this.addError.set('Enter a pharmacy ID first.');
      return;
    }

    this.adding.set(true);
    this.addError.set('');

    this.favoriteService.check(this.userId, this.newPharmacyId).subscribe({
      next: (alreadyFavorited) => {
        if (alreadyFavorited) {
          this.addError.set('This pharmacy is already in your favorites.');
          this.adding.set(false);
          return;
        }

        this.createFavorite();
      },

      error: (error) => {
        console.error('Failed to check favorite status:', error);
        this.createFavorite();
      },
    });
  }

  private createFavorite(): void {
    this.favoriteService
      .create(this.userId, { pharmacyId: this.newPharmacyId! })
      .subscribe({
        next: (favorite) => {
          this.favorites.update((current) => [favorite, ...current]);
          this.newPharmacyId = null;
          this.adding.set(false);
        },

        error: (error) => {
          console.error('Failed to add favorite:', error);

          this.addError.set(
            error?.error?.detail ||
              error?.error?.message ||
              'Failed to add that pharmacy to favorites.',
          );

          this.adding.set(false);
        },
      });
  }

  removeFavorite(favorite: FavoriteResponse): void {
    this.removingId.set(favorite.id);

    this.favoriteService.delete(this.userId, favorite.id).subscribe({
      next: () => {
        this.favorites.update((current) => current.filter((f) => f.id !== favorite.id));
        this.removingId.set(null);
      },

      error: (error) => {
        console.error('Failed to remove favorite:', error);

        this.error.set(
          error?.error?.detail || error?.error?.message || 'Failed to remove that favorite.',
        );

        this.removingId.set(null);
      },
    });
  }

  viewPharmacy(favorite: FavoriteResponse): void {
    // Absolute path: the old relative '../patient/pharmacy-list' depended on the current URL.
    this.router.navigate(['/patient/pharmacy-list', favorite.pharmacyId]);
  }
}