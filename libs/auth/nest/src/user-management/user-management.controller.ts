import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { InvitationListResponse, InvitationResponse, UserListItem, UserListResponse, UserRole } from '@auth-lib/common';
import { CurrentUser, Roles } from '../auth';
import { UserEntity } from '../user';
import { UpdateRoleDto } from './dto/update-role.dto';
import { UserManagementService } from './user-management.service';
import { InvitationEntity, InvitationService } from '../invitation';
import { USER_MANAGEMENT_CONFIG, UserManagementConfig } from './user-management.config';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Controller('users')
export class UserManagementController {
  constructor(
    private readonly userManagementService: UserManagementService,
    private readonly invitationService: InvitationService,
    @Inject(USER_MANAGEMENT_CONFIG) protected readonly config: UserManagementConfig,
  ) {}

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

  @Post('invitation')
  @Roles(UserRole.ADMIN)
  async createInvitation(
    @Body() dto: CreateInvitationDto,
    @CurrentUser() user: UserEntity,
  ): Promise<InvitationResponse> {
    const invitation: InvitationEntity = await this.invitationService.create({
      email: dto.email,
      createdBy: user,
      expiryDays: this.config.inviteTokenExpiryDays,
    });

    return this.mapToResponse(invitation);
  }

  @Get('invitation')
  @Roles(UserRole.ADMIN)
  async findAllInvitations(): Promise<InvitationListResponse> {
    const invitations: InvitationEntity[] = await this.invitationService.findAll();
    return {
      invitations: invitations.map((inv) => this.mapToResponse(inv)),
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    const invitation: InvitationEntity | null = await this.invitationService.findById(id);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const deleted: boolean = await this.invitationService.delete(id);
    return { success: deleted };
  }

  private mapToResponse(invitation: InvitationEntity): InvitationResponse {
    return {
      id: invitation.id,
      token: invitation.token,
      email: invitation.email,
      used: invitation.used,
      createdAt: invitation.createdAt,
      expiresAt: invitation.expiresAt,
      createdBy: {
        id: invitation.createdBy.id,
        name: invitation.createdBy.name,
      },
    };
  }
}
