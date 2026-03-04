import { IsEnum } from 'class-validator';
import { UpdateUserRoleRequest, UserRole } from '@task-manager/shared-api';

export class UpdateRoleDto implements UpdateUserRoleRequest {
  @IsEnum(UserRole)
  role!: UserRole;
}
