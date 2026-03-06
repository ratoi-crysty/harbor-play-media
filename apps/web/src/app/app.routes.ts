import { Route } from '@angular/router';
import { ShellComponent } from './shell/shell.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { PlayerComponent } from './features/player/player.component';

export const appRoutes: Route[] = [
  {
    path: '',
    component: ShellComponent,
    children: [
      { path: '', component: DashboardComponent },
      { path: 'player/:id', component: PlayerComponent },
    ],
  },
  { path: '**', redirectTo: '' },
];
