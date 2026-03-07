import { RegistrationMode } from '@auth-lib/common';

export interface AuthModuleConfig {
  registrationMode: RegistrationMode;
}

export const AUTH_CONFIG = 'AUTH_CONFIG';
