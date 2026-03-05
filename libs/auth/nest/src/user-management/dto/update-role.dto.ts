import { IsEnum } from 'class-validator';
import { UpdateUserRoleRequest, UserRole } from '@harbor-play-media/common';

export class UpdateRoleDto implements UpdateUserRoleRequest {
  @IsEnum(UserRole)
  role!: UserRole;
}
