import { IsEnum } from 'class-validator';
import { UpdateUserRoleRequest, UserRole } from '@auth-lib/common';

export class UpdateRoleDto implements UpdateUserRoleRequest {
  @IsEnum(UserRole)
  role!: UserRole;
}
