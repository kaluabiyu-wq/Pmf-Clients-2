import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { homeFor } from '../features/auth/role-access';

/** The signed-in user must be linked to a pharmacy. */
export const hasPharmacyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.pharmacyId() !== null ? true : router.createUrlTree([homeFor(auth.role())]);
};

/** For routes with a :pharmacyId param: it must equal the signed-in user's pharmacy. */
export const ownPharmacyGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const requested = Number(route.paramMap.get('pharmacyId'));
  return requested === auth.pharmacyId() ? true : router.createUrlTree(['/unauthorized']);
};