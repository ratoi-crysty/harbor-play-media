import * as path from 'path';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Res,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { CollectionModel } from '@harbor-play-media/shared-api';
import { CurrentUser } from '@auth-lib/nest';
import { UserEntity } from '@auth-lib/nest';
import { UserRole } from '@auth-lib/common';
import { ShareResourceType } from '@harbor-play-media/shared-api';
import { CollectionEntity } from './collection.entity';
import { CollectionService } from './collection.service';
import { ShareService } from '../share/share.service';
import { CreateCollectionDto } from './dto/create-collection.dto';
import { UpdateCollectionDto } from './dto/update-collection.dto';
import { environment } from '../../environments/environment';

@Controller('collections')
export class CollectionController {
  constructor(
    private readonly collectionService: CollectionService,
    private readonly shareService: ShareService,
  ) {}

  @Get()
  async findAll(
    @CurrentUser() user: UserEntity,
    @Query('parentId') parentId?: string,
  ): Promise<CollectionModel[]> {
    const entities: CollectionEntity[] = await this.collectionService.findForUser(user.id, parentId);
    return entities.map((e: CollectionEntity) => this.toResponse(e));
  }

  @Get(':id')
  async getById(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<CollectionModel> {
    const entity: CollectionEntity = await this.collectionService.getById(id);
    await this.assertAccess(entity, user);
    return this.toResponse(entity);
  }

  @Post()
  @UseInterceptors(
    FileInterceptor('thumbnailAsset', { dest: environment.uploadsPath }),
  )
  async create(
    @Body() dto: CreateCollectionDto,
    @CurrentUser() user: UserEntity,
    @UploadedFile() thumbnailFile?: Express.Multer.File,
  ): Promise<CollectionModel> {
    const entity: CollectionEntity = await this.collectionService.create({
      name: dto.name,
      description: dto.description ?? '',
      parentId: dto.parentId,
      ownerId: user.id,
      thumbnailPath: thumbnailFile?.path,
    });

    return this.toResponse(entity);
  }

  @Patch(':id')
  @UseInterceptors(
    FileInterceptor('thumbnailAsset', { dest: environment.uploadsPath }),
  )
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCollectionDto,
    @CurrentUser() user: UserEntity,
    @UploadedFile() thumbnailFile?: Express.Multer.File,
  ): Promise<CollectionModel> {
    const entity: CollectionEntity = await this.collectionService.getById(id);
    this.assertOwnerOrAdmin(entity, user);

    const updated: CollectionEntity = await this.collectionService.update(id, {
      name: dto.name,
      description: dto.description,
      thumbnailPath: thumbnailFile?.path,
    });

    return this.toResponse(updated);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(
    @Param('id') id: string,
    @CurrentUser() user: UserEntity,
  ): Promise<void> {
    const entity: CollectionEntity = await this.collectionService.getById(id);
    this.assertOwnerOrAdmin(entity, user);
    await this.collectionService.delete(id);
  }

  @Post(':id/move')
  async move(
    @Param('id') id: string,
    @Body('parentId') parentId: string | undefined,
    @CurrentUser() user: UserEntity,
  ): Promise<CollectionModel> {
    const entity: CollectionEntity = await this.collectionService.getById(id);
    this.assertOwnerOrAdmin(entity, user);
    const moved: CollectionEntity = await this.collectionService.move(id, parentId);
    return this.toResponse(moved);
  }

  @Get(':id/thumbnail')
  async thumbnail(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const entity: CollectionEntity = await this.collectionService.getById(id);

    if (!entity.thumbnailPath) {
      throw new NotFoundException('Thumbnail not available');
    }

    const ext: string = path.extname(entity.thumbnailPath).toLowerCase();
    const contentType: string = ext === '.png' ? 'image/png' : 'image/jpeg';

    res.set('Content-Type', contentType);
    res.sendFile(entity.thumbnailPath);
  }

  private async assertAccess(entity: CollectionEntity, user: UserEntity): Promise<void> {
    if (entity.ownerId === user.id) return;
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN) return;
    const hasShare: boolean = await this.shareService.canAccess(
      user.id,
      ShareResourceType.COLLECTION,
      entity.id,
    );
    if (hasShare) return;
    throw new ForbiddenException('You do not have access to this collection');
  }

  private assertOwnerOrAdmin(entity: CollectionEntity, user: UserEntity): void {
    if (entity.ownerId === user.id) return;
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN) return;
    throw new ForbiddenException('Only the owner or an admin can modify this collection');
  }

  private toResponse(entity: CollectionEntity): CollectionModel {
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      thumbnailUrl: this.collectionService.getThumbnailUrl(entity),
      parentId: entity.parentId,
      ownerId: entity.ownerId,
      createdAt: entity.createdAt.toISOString(),
      itemCount: entity.media?.length ?? 0,
    };
  }
}
