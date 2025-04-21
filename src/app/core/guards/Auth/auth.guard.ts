import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../feature/auth/services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticate()) {
    // Stocke l'URL demandée pour redirection après login
    const returnUrl = state.url !== '/' ? encodeURIComponent(state.url) : undefined;
    console.log(`Utilisateur non authentifié, redirection vers login (returnUrl: ${returnUrl})`);
    
    router.navigate(['/auth/login'], returnUrl ? { queryParams: { returnUrl } } : undefined);
    return false;
  }

  // Optionnel : Vérification du rôle si nécessaire
  if (route.data?.['expectedRoles']) {
    const userRole = authService.getUserRole();
    if (!route.data['expectedRoles'].includes(userRole)) {
      const defaultRoute = authService.getDefaultRouteForRole(userRole);
      console.log(`Accès refusé (rôle ${userRole}), redirection vers ${defaultRoute}`);
      router.navigateByUrl(defaultRoute);
      return false;
    }
  }

  return true;
};