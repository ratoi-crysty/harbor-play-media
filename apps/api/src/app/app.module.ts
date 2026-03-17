import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationMode } from '@auth-lib/common';
import { AuthModule, UserManagementModule } from '@auth-lib/nest';
import { MediaModule } from './media/media.module';

function getRegistrationMode(): RegistrationMode {
  const mode: string | undefined = process.env['REGISTRATION_MODE'];
  if (mode && Object.values(RegistrationMode).includes(mode as RegistrationMode)) {
    return mode as RegistrationMode;
  }
  return RegistrationMode.INVITE;
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'better-sqlite3',
      database: 'data/database.sqlite',
      autoLoadEntities: true,
      synchronize: true,
    }),
    AuthModule.forRoot({
      registrationMode: getRegistrationMode(),
    }),
    UserManagementModule.forRoot({
      inviteTokenExpiryDays: Number(process.env['INVITE_TOKEN_EXPIRY_DAYS'] ?? '7'),
    }),
    MediaModule,
  ],
})
export class AppModule {}
