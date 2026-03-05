export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export enum UserStatus {
  AWAITING_CONFIRMATION = 'awaitingConfirmation',
  REGISTERED = 'registered',
}

export enum RegistrationMode {
  OPEN = 'open',
  CONFIRMATION = 'confirmation',
  INVITE = 'invite',
}
