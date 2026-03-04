import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { UserManagementController } from './user-management.controller';
import { UserManagementService } from './user-management.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [UserModule, AuthModule],
  controllers: [UserManagementController],
  providers: [UserManagementService],
  exports: [UserManagementService],
})
export class UserManagementModule {}
