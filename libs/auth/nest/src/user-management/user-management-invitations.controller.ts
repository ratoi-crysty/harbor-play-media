import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { InvitationListResponse, InvitationResponse, UserRole } from '@auth-lib/common';
import { CurrentUser, Roles } from '../auth';
import { UserEntity } from '../user';
import { InvitationEntity, InvitationService } from '../invitation';
import { USER_MANAGEMENT_CONFIG, UserManagementConfig } from './user-management.config';
import { CreateInvitationDto } from './dto/create-invitation.dto';

@Controller('invitation')
export class UserManagementInvitationsController {
  constructor(
    private readonly invitationService: InvitationService,
    @Inject(USER_MANAGEMENT_CONFIG) protected readonly config: UserManagementConfig,
  ) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAllInvitations(): Promise<InvitationListResponse> {
    const invitations: InvitationEntity[] = await this.invitationService.findAll();
    return {
      invitations: invitations.map((inv) => this.mapToResponse(inv)),
    };
  }

  @Post()
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
