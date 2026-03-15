import { Route } from '@angular/router';

export const adminRoutes: Route[] = [
  {
    path: 'users',
    loadComponent: () =>
      import('./user-management/user-management.component').then(
        (m) => m.UserManagementComponent
      ),
  },
  {
    path: 'invitations',
    loadComponent: () =>
      import('./invitation-management/invitation-management.component').then(
        (m) => m.InvitationManagementComponent
      ),
  },
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full',
  },
];
