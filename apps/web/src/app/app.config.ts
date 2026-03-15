import { ApplicationConfig, ErrorHandler, inject, provideBrowserGlobalErrorListeners, provideAppInitializer } from '@angular/core';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import Bugsnag from '@bugsnag/js';
import { BugsnagErrorHandler } from '@bugsnag/plugin-angular';
import { appRoutes } from './app.routes';
import { authInterceptor, AuthService } from '@auth-lib/angular';

function errorHandlerFactory(): ErrorHandler {
  return Bugsnag.isStarted() ? new BugsnagErrorHandler() : new ErrorHandler();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    { provide: ErrorHandler, useFactory: errorHandlerFactory },
    provideRouter(
      appRoutes,
      withViewTransitions({ skipInitialTransition: true }),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAppInitializer(() => firstValueFrom(inject(AuthService).init())),
  ],
};
