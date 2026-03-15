import { DynamicModule, Module, Provider } from '@nestjs/common';
import { UserModule } from '../user';
import { UserManagementController } from './user-management.controller';
import { UserManagementInvitationsController } from './user-management-invitations.controller';
import { UserManagementService } from './user-management.service';
import { USER_MANAGEMENT_CONFIG, UserManagementConfig } from './user-management.config';
import { InvitationModule } from '../invitation';

const providers: Provider[] = [UserManagementService];

@Module({
  imports: [UserModule, InvitationModule],
  controllers: [UserManagementController, UserManagementInvitationsController],
  providers,
  exports: [UserManagementService],
})
export class UserManagementModule {
  static forRoot(config: UserManagementConfig): DynamicModule {
    return {
      module: UserManagementModule,
      providers: [...providers, { provide: USER_MANAGEMENT_CONFIG, useValue: config }],
    };
  }
}
