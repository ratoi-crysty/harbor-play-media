import { InjectionToken } from '@angular/core';

export interface AuthConfig {
  apiUrl: string;
}

export const AUTH_CONFIG = new InjectionToken<AuthConfig>('auth.angular.config', {
  providedIn: 'root',
  factory: (): AuthConfig => ({ apiUrl: '/api' }),
});
