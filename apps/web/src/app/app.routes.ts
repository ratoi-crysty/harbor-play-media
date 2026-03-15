import { Route } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { DashboardPageComponent } from './features/dashboard/dashboard-page.component';
import { PlayerPageComponent } from './features/player/player-page.component';
import { AuthShellComponent } from './features/auth/auth-shell/auth-shell.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { authGuard, nonAuthGuard } from '@auth-lib/angular';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: DashboardPageComponent },
      { path: 'player/:id', component: PlayerPageComponent },
    ],
  },
  {
    path: 'auth',
    component: AuthShellComponent,
    canActivate: [nonAuthGuard],
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full' },
    ],
  },
  { path: '**', redirectTo: '' },
];
