import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map, Observable } from 'rxjs';
import { isAllowed, UserResponse, UserRole } from '@harbor-play-media/common';

export function createRoleGuard(roles: UserRole[]): CanActivateFn {
  return (): Observable<true | UrlTree> => {
    const authService: AuthService = inject(AuthService);
    const router: Router = inject(Router);

    return authService.user$.pipe(
      map(
        (user: UserResponse | undefined): true | UrlTree =>
          !!(user && isAllowed(user, roles)) || router.createUrlTree(['/']),
      ),
    );
  };
}

export function adminGuard(): CanActivateFn {
  return createRoleGuard([UserRole.ADMIN]);
}

export function superadminGuard(): CanActivateFn {
  return createRoleGuard([UserRole.SUPERADMIN]);
}
