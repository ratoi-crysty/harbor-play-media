import { RegistrationMode } from '@harbor-play-media/common';

export interface AuthModuleConfig {
  registrationMode: RegistrationMode;
  inviteTokenExpiryDays: number;
}

export const AUTH_CONFIG = 'AUTH_CONFIG';
