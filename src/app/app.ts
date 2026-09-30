import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth-service.service';
import { NAV_ITEMS } from './features/auth/role-access';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('pmf-client');

  private readonly router = inject(Router);
  protected readonly auth = inject(AuthService);

  /** Only the nav buttons the current role is allowed to open. */
  protected readonly navItems = computed(() => {
    const role = this.auth.role();
    return role ? NAV_ITEMS.filter((item) => item.roles.includes(role)) : [];
  });

  goTo(path: string) {
    this.router.navigate([path]);
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}