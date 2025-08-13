import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './service/auth.service';
import { inject } from '@angular/core';
import { map } from 'rxjs';

export const isAuthenticatedGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    map((isAuth) => {
      if (!isAuth) {
        return router.createUrlTree(['/login']);
      }
      return true;
    })
  );
};


export const isLoggedOutGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated().pipe(
    map((isAuth) => {
      if (isAuth) {
        return router.createUrlTree(['/overview']);
      }
      return true;
    })
  );
};
