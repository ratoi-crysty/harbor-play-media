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
import { InvitationListResponse, InvitationResponse, UserRole } from '@task-manager/shared-api';
import { CurrentUser } from '../auth/current-user.decorator';
import { User } from '../user/user.entity';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { Invitation } from './invitation.entity';
import { InvitationService } from './invitation.service';
import { Roles } from '../auth/auth.guard';
import { INVITATION_CONFIG, InvitationConfig } from './invitation.config';

@Controller('invitations')
export class InvitationController {
  constructor(
    private readonly invitationService: InvitationService,
    @Inject(INVITATION_CONFIG) protected readonly config: InvitationConfig,
  ) {}

  @Post()
  @Roles(UserRole.ADMIN)
  async create(@Body() dto: CreateInvitationDto, @CurrentUser() user: User): Promise<InvitationResponse> {
    const invitation: Invitation = await this.invitationService.create({
      email: dto.email,
      createdBy: user,
      expiryDays: this.config.inviteTokenExpiryDays,
    });

    return this.mapToResponse(invitation);
  }

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll(): Promise<InvitationListResponse> {
    const invitations: Invitation[] = await this.invitationService.findAll();
    return {
      invitations: invitations.map((inv) => this.mapToResponse(inv)),
    };
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  async delete(@Param('id', ParseIntPipe) id: number): Promise<{ success: boolean }> {
    const invitation: Invitation | null = await this.invitationService.findById(id);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const deleted: boolean = await this.invitationService.delete(id);
    return { success: deleted };
  }

  private mapToResponse(invitation: Invitation): InvitationResponse {
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
