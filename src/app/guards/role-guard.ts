import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { RoleName } from '../model/user.model';
import { homeFor } from '../features/auth/role-access';

/** Needs a logged-in user whose role is listed in route.data['roles']. */
export const roleGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const allowed = route.data['roles'] as readonly RoleName[] | undefined;
  if (!allowed || auth.hasRole(...allowed)) return true;

  // Wrong role: send them to their own home, or /unauthorized if they have none.
  const home = homeFor(auth.role());
  return router.createUrlTree([home === '/login' ? '/unauthorized' : home]);
};

/** For login/signup pages: logged-in users are sent to their own home instead. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

   if (!auth.isAuthenticated()) return true;

  const home = homeFor(auth.role());
  // Authenticated but no recognised role: stay on the guest page (prevents a redirect loop).
  return home === '/login' ? true : router.createUrlTree([home]);
};

/** For '/' and unknown URLs: send people to login or their role's home. */
export const homeRedirectGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return router.createUrlTree([auth.isAuthenticated() ? homeFor(auth.role()) : '/login']);
};