import { ApplicationConfig, inject, provideBrowserGlobalErrorListeners, provideAppInitializer } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { appRoutes } from './app.routes';
import { authInterceptor, AuthService } from '@auth-lib/angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      appRoutes,
      withViewTransitions({ skipInitialTransition: true }),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => firstValueFrom(inject(AuthService).init())),
  ],
};
