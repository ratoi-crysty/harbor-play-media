import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationMode } from '@auth-lib/common';
import { AuthModule, UserEntity, SessionEntity, InvitationEntity, UserManagementModule } from '@auth-lib/nest';

function getRegistrationMode(): RegistrationMode {
  const mode: string = process.env['REGISTRATION_MODE'] ?? 'open';
  if (Object.values(RegistrationMode).includes(mode as RegistrationMode)) {
    return mode as RegistrationMode;
  }
  return RegistrationMode.INVITE;
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data/database.sqlite',
      entities: [UserEntity, SessionEntity, InvitationEntity],
      synchronize: true,
    }),
    AuthModule.forRoot({
      registrationMode: getRegistrationMode(),
    }),
    UserManagementModule.forRoot({
      inviteTokenExpiryDays: Number(process.env['INVITE_TOKEN_EXPIRY_DAYS'] ?? '7'),
    }),
  ],
})
export class AppModule {}
