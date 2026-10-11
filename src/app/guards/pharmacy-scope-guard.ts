import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { homeFor } from '../features/auth/role-access';


export const hasPharmacyGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  if (auth.pharmacyId() !== null) {
    return true;
  }

  const target = auth.role() === 'Pharmacy' ? '/unauthorized' : homeFor(auth.role());
  return router.createUrlTree([target]);
};

export const ownPharmacyGuard: CanActivateFn = (route) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Platform admins review any pharmacy; the API still enforces what they may change.
  if (auth.hasRole('PharmacyAdmin', 'SysAdmin')) {
    return true;
  }

  const requested = Number(route.paramMap.get('pharmacyId'));
  return requested === auth.pharmacyId() ? true : router.createUrlTree(['/unauthorized']);
};