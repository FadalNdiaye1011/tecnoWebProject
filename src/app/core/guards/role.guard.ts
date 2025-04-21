import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../feature/auth/services/auth.service';
import { inject } from '@angular/core';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRoles = route.data['expectedRoles'] as Array<string>;
  const userRole = authService.getUserRole();

  if (!expectedRoles || expectedRoles.includes(userRole)) {
    return true;
  }

  // Redirection vers la page par défaut selon le rôle
  router.navigate([authService.getDefaultRouteForRole(userRole)]);
  return false;
};
