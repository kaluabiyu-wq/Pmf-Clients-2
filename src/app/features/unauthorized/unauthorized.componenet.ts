import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth-service.service';
import { homeFor } from '../auth/role-access';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  template: `
    <section class="auth-card">
      <header class="auth-header">
        <span class="auth-brand">PMF</span>
        <h2>You don't have access to this page</h2>
        <p>Your account role doesn't include this part of the app.</p>
      </header>
      <div class="actions">
        <button type="button" class="btn-primary" (click)="goHome()">Go to my page</button>
      </div>
    </section>
  `,
  styleUrl: './unauthorized.componenet.scss',
})
export class UnauthorizedComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  goHome(): void {
    this.router.navigateByUrl(homeFor(this.auth.role()));
  }
}