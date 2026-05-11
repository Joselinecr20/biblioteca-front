import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route) => {
  const auth   = inject(AuthService);
  const router = inject(Router);

  if (!auth.isLoggedIn()) {
    router.navigate(['/login']);
    return false;
  }

  const allowedRoles = route.data?.['roles'] as string[] | undefined;
  const userRole     = auth.getRol();

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    auth.redirectToDashboard();
    return false;
  }

  return true;
};
