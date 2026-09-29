import { inject } from '@angular/core';
import { CanActivateFn, Router, RedirectCommand } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { RoleName } from '../model/user.model';

export const roleGuard = (allowedRoles: RoleName[]): CanActivateFn => {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);

    if (auth.hasRole(...allowedRoles)) {
      return true;
    }

    return new RedirectCommand(router.parseUrl('/unauthorized'), {
      skipLocationChange: true,
    });
  };
};