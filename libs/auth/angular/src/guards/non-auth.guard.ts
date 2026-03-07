import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, Observable } from 'rxjs';

export const nonAuthGuard: CanActivateFn = (): Observable<true | UrlTree> => {
  const authService: AuthService = inject(AuthService);
  const router: Router = inject(Router);

  return authService.isAuthenticated$.pipe(
    map((value: boolean): true | UrlTree => {
      console.log('NonAuthGuard', value);

      return !value || router.createUrlTree(['/']);
    }),
  );
};
