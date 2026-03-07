import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationMode } from '@auth-lib/common';
import { AuthModule, UserEntity, SessionEntity, InvitationEntity, UserManagementModule } from '@auth-lib/nest';
import { AppController } from './app.controller';
import { AppService } from './app.service';

function getRegistrationMode(): RegistrationMode {
  const mode: string = process.env['REGISTRATION_MODE'] ?? 'open';
  if (Object.values(RegistrationMode).includes(mode as RegistrationMode)) {
    return mode as RegistrationMode;
  }
  return RegistrationMode.OPEN;
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
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
