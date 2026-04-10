import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Post,
} from '@nestjs/common';
import { ShareModel, ShareResourceType } from '@harbor-play-media/shared-api';
import { CurrentUser } from '@auth-lib/nest';
import { UserEntity } from '@auth-lib/nest';
import { ShareEntity } from './share.entity';
import { ShareService } from './share.service';
import { CreateShareDto } from './dto/create-share.dto';

@Controller('shares')
export class ShareController {
  constructor(private readonly shareService: ShareService) {}

  @Post()
  async create(
    @Body() dto: CreateShareDto,
    @CurrentUser() user: UserEntity,
  ): Promise<ShareModel> {
    const entity: ShareEntity = await this.shareService.createShare(
      dto.resourceType,
      dto.resourceId,
      dto.email,
      user.id,
    );
    return this.toResponse(entity);
  }

  @Get('resource/:type/:id')
  async findForResource(
    @Param('type') type: ShareResourceType,
    @Param('id') id: string,
  ): Promise<ShareModel[]> {
    const entities: ShareEntity[] = await this.shareService.findForResource(type, id);
    return entities.map((e: ShareEntity) => this.toResponse(e));
  }

  @Get('shared-with-me')
  async sharedWithMe(@CurrentUser() user: UserEntity): Promise<ShareModel[]> {
    const entities: ShareEntity[] = await this.shareService.findSharedWithUser(user.id);
    return entities.map((e: ShareEntity) => this.toResponse(e));
  }

  @Delete(':id')
  @HttpCode(204)
  async revoke(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    const entity: ShareEntity = await this.shareService.getById(id);
    // Only the sharer or the sharee can revoke
    if (entity.sharedByUserId !== user.id && entity.sharedWithUserId !== user.id) {
      throw new ForbiddenException('You cannot revoke this share');
    }
    await this.shareService.revoke(id);
  }

  private toResponse(entity: ShareEntity): ShareModel {
    return {
      id: entity.id,
      resourceType: entity.resourceType,
      resourceId: entity.resourceId,
      sharedWithUserId: entity.sharedWithUserId,
      sharedWithUserEmail: entity.sharedWithUser?.email ?? '',
      sharedWithUserName: entity.sharedWithUser?.name ?? '',
      sharedByUserId: entity.sharedByUserId,
      permission: entity.permission,
      createdAt: entity.createdAt.toISOString(),
    };
  }
}
