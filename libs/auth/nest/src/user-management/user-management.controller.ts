import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
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
    const users: UserEntity[] = await this.userManagementService.findAll();

    return users.map((user: UserEntity) => this.toListItem(user));
  }

  @Patch(':id/role')
  @Roles(UserRole.SUPERADMIN)
  async updateRole(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() currentUser: UserEntity,
  ): Promise<UserListItem> {
    const user: UserEntity = await this.userManagementService.updateRole(id, dto.role, currentUser);
    return this.toListItem(user);
  }

  @Post(':id/confirm')
  @Roles(UserRole.ADMIN)
  async confirmUser(@Param('id', ParseIntPipe) id: number): Promise<UserListItem> {
    const user: UserEntity = await this.userManagementService.confirmUser(id);
    return this.toListItem(user);
  }

  private toListItem(user: UserEntity): UserListItem {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
