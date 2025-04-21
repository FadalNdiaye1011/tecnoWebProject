import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../../feature/auth/services/auth.service';

export const notRetainAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticate()) {
    const userRole = authService.getUserRole();
    const defaultRoute = authService.getDefaultRouteForRole(userRole);
    
   
    router.navigateByUrl(defaultRoute);
    return false;
  }
  
  return true;
};