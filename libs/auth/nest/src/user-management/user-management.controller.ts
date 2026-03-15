import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserListItem, UserListResponse, UserRole } from '@auth-lib/common';
import { CurrentUser, Roles } from '../auth';
import { UserEntity } from '../user';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserManagementService } from './user-management.service';

@Controller('user')
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAllUsers(): Promise<UserListResponse> {
    const users: UserListItem[] = await this.userManagementService.findAll();
    return { users };
  }

  @Patch(':id/role')
  @Roles(UserRole.SUPERADMIN)
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<UserListItem> {
    return this.userManagementService.updateRole(id, dto.role, currentUser);
  }

  @Post(':id/confirm')
  @Roles(UserRole.ADMIN)
  async confirmUser(@Param('id', ParseIntPipe) id: number): Promise<UserListItem> {
    return this.userManagementService.confirmUser(id);
  }
}
