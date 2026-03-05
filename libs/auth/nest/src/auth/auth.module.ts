import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RegistrationMode } from '@harbor-play-media/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AUTH_CONFIG, AuthModuleConfig } from './auth.config';
import { UserModule } from '../user';
import { InvitationModule } from '../invitation';
import { AuthGuard } from './auth.guard';

@Module({})
export class AuthModule {
  static forRoot(config?: Partial<AuthModuleConfig>): DynamicModule {
    const authConfig: Required<AuthModuleConfig> = {
      registrationMode: config?.registrationMode ?? RegistrationMode.OPEN,
      inviteTokenExpiryDays: config?.inviteTokenExpiryDays ?? 7,
    };

    return {
      module: AuthModule,
      imports: [UserModule, InvitationModule.forRoot({inviteTokenExpiryDays: authConfig.inviteTokenExpiryDays})],
      controllers: [AuthController],
      providers: [
        {
          provide: AUTH_CONFIG,
          useValue: authConfig,
        },
        AuthService,
        {
          provide: APP_GUARD,
          useClass: AuthGuard,
        },
      ],
      exports: [AuthService, AUTH_CONFIG],
    };
  }
}
