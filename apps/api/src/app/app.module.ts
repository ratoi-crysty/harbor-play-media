import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './user/user.entity';
import { Session } from './auth/session.entity';
import { Invitation } from './invitation/invitation.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { UserManagementModule } from './user-management/user-management.module';

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
      entities: [User, Session, Invitation],
      synchronize: true,
    }),
    UserModule,
    AuthModule.forRoot({
      registrationMode: getRegistrationMode(),
      inviteTokenExpiryDays: Number(process.env['INVITE_TOKEN_EXPIRY_DAYS'] ?? '7'),
    }),
    UserManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
