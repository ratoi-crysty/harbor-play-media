import { DynamicModule, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Invitation } from './invitation.entity';
import { InvitationController } from './invitation.controller';
import { InvitationService } from './invitation.service';
import { UserModule } from '../user/user.module';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';
import { INVITATION_CONFIG, InvitationConfig } from './invitation.config';

const baseProviders: Provider[] = [InvitationService];

@Module({
  imports: [TypeOrmModule.forFeature([Invitation]), UserModule],
  controllers: [InvitationController],
  providers: baseProviders,
  exports: [InvitationService],
})
export class InvitationModule {
  static forRoot(config: InvitationConfig): DynamicModule {
    return {
      module: InvitationModule,
      providers: [
        ...baseProviders,
        {
          provide: INVITATION_CONFIG,
          useValue: config,
        },
      ],
    };
  }
}
