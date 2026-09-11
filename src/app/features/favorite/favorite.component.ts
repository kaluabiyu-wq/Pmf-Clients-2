import { DatePipe } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { FavoriteService } from '../../services/favorite.service';
import { FavoriteResponse } from '../../model/favorite.model';

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [FormsModule, DatePipe],
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss',
})
export class FavoriteComponent implements OnInit {
  private readonly favoriteService = inject(FavoriteService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  userId!: number;

  favorites = signal<FavoriteResponse[]>([]);
  loading = signal(false);
  error = signal('');

  newPharmacyId: number | null = null;
  adding = signal(false);
  addError = signal('');

  removingId = signal<number | null>(null);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const userId = Number(params.get('userId'));

      if (!userId) {
        this.error.set('Invalid user ID.');
        return;
      }

      this.userId = userId;
      this.loadFavorites();
    });
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
          error?.error?.detail || error?.error?.message || 'Failed to load favorites.'
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
              'Failed to add that pharmacy to favorites.'
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
          error?.error?.detail || error?.error?.message || 'Failed to remove that favorite.'
        );

        this.removingId.set(null);
      },
    });
  }

  viewPharmacy(favorite: FavoriteResponse): void {
    this.router.navigate(['/pharmacy-list', favorite.pharmacyId]);
  }
}