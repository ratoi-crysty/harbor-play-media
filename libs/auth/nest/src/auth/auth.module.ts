import { DynamicModule, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { RegistrationMode } from '@auth-lib/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AUTH_CONFIG, AuthModuleConfig } from './auth.config';
import { UserModule } from '../user';
import { InvitationModule } from '../invitation';
import { AuthGuard } from './auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SessionEntity } from './session.entity';

@Module({})
export class AuthModule {
  static forRoot(config?: Partial<AuthModuleConfig>): DynamicModule {
    const authConfig: Required<AuthModuleConfig> = {
      registrationMode: config?.registrationMode ?? RegistrationMode.OPEN,
    };

    return {
      module: AuthModule,
      imports: [UserModule, InvitationModule, TypeOrmModule.forFeature([SessionEntity])],
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
