import * as fs from 'fs';
import * as path from 'path';
import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { MediaModel } from '@harbor-play-media/shared-api';
import { CurrentUser } from '@auth-lib/nest';
import { UserEntity } from '@auth-lib/nest';
import { UserRole } from '@auth-lib/common';
import { MediaEntity } from './media.entity';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { UpdateMediaDto } from './dto/update-media.dto';
import { environment } from '../../environments/environment';
import { CollectionService } from '../collection/collection.service';

@Controller('media')
export class MediaController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly collectionsService: CollectionService,
  ) {}

  @Get()
  async findAll(@CurrentUser() user: UserEntity): Promise<MediaModel[]> {
    const entities: MediaEntity[] = await this.mediaService.findForUser(user.id);
    return entities.map((e: MediaEntity) => this.toResponse(e));
  }

  @Get(':id')
  async getById(@Param('id') id: string, @Req() req: Request, @CurrentUser() user: UserEntity): Promise<MediaModel> {
    const entity: MediaEntity = await this.mediaService.getById(id);

    await this.assertAccess(entity, user);

    const viewedIds: string[] = req.session.viewedMediaIds ?? [];
    req.session.viewedMediaIds = await this.mediaService.incrementViewCountIfNew(id, viewedIds);

    return this.toResponse(entity);
  }

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'mediaAsset', maxCount: 1 },
        { name: 'thumbnailAsset', maxCount: 1 },
      ],
      { dest: environment.uploadsPath },
    ),
  )
  async create(
    @Body() dto: CreateMediaDto,
    @UploadedFiles()
    files: { mediaAsset?: Express.Multer.File[]; thumbnailAsset?: Express.Multer.File[] },
    @CurrentUser() user: UserEntity,
  ): Promise<MediaModel> {
    const mediaFile: Express.Multer.File | undefined = files.mediaAsset?.[0];
    if (!mediaFile) {
      throw new NotFoundException('No media file provided');
    }

    const entity: MediaEntity = await this.mediaService.create({
      title: dto.title,
      description: dto.description ?? '',
      mediaFile,
      thumbnailFile: files.thumbnailAsset?.[0],
      ownerId: user.id,
      collectionId: dto.collectionId,
      tags: dto.tags || [],
    });

    return this.toResponse(entity);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateMediaDto,
    @CurrentUser() user: UserEntity,
  ): Promise<MediaModel> {
    const entity: MediaEntity = await this.mediaService.getById(id);
    this.assertOwnerOrAdmin(entity, user);

    const updated: MediaEntity = await this.mediaService.update(id, {
      title: dto.title,
      description: dto.description,
      tags: dto.tags,
    });

    return this.toResponse(updated);
  }

  @Get(':id/stream')
  async stream(@Param('id') id: string, @Req() req: Request, @Res() res: Response): Promise<void> {
    const entity: MediaEntity = await this.mediaService.getById(id);
    const filePath: string = entity.filePath;

    const stat: fs.Stats = fs.statSync(filePath);
    const fileSize: number = stat.size;
    const range: string | undefined = req.headers['range'];

    if (range) {
      const parts: string[] = range.replace(/bytes=/, '').split('-');
      const start: number = parseInt(parts[0], 10);
      const end: number = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize: number = end - start + 1;

      res.status(206).set({
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': entity.mimeType,
      });

      fs.createReadStream(filePath, { start, end }).pipe(res);
    } else {
      res.status(200).set({
        'Accept-Ranges': 'bytes',
        'Content-Length': fileSize,
        'Content-Type': entity.mimeType,
      });

      fs.createReadStream(filePath).pipe(res);
    }
  }

  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const entity: MediaEntity = await this.mediaService.getById(id);
    const filePath: string = entity.filePath;
    const ext: string = path.extname(filePath);
    const fileName = `${entity.title}${ext}`;

    res.set({
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Content-Type': entity.mimeType,
    });

    fs.createReadStream(filePath).pipe(res);
  }

  @Get(':id/thumbnail')
  async thumbnail(@Param('id') id: string, @Res() res: Response): Promise<void> {
    const entity: MediaEntity = await this.mediaService.getById(id);

    if (!entity.thumbnailPath) {
      throw new NotFoundException('Thumbnail not available');
    }

    const ext: string = path.extname(entity.thumbnailPath).toLowerCase();
    const contentType: string = ext === '.png' ? 'image/png' : 'image/jpeg';

    res.set('Content-Type', contentType);
    res.sendFile(entity.thumbnailPath);
  }

  @Post(':id/move')
  async move(
    @Param('id') id: string,
    @Body('collectionId') collectionId: string | undefined,
    @CurrentUser() user: UserEntity,
  ): Promise<MediaModel> {
    const entity: MediaEntity = await this.mediaService.getById(id);
    this.assertOwnerOrAdmin(entity, user);
    const moved: MediaEntity = await this.mediaService.moveToCollection(id, collectionId);
    return this.toResponse(moved);
  }

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string, @CurrentUser() user: UserEntity): Promise<void> {
    const entity: MediaEntity = await this.mediaService.getById(id);
    this.assertOwnerOrAdmin(entity, user);
    await this.mediaService.delete(id);
  }

  private async assertAccess(entity: MediaEntity, user: UserEntity): Promise<void> {
    // Ownerless media (legacy) is visible to all
    if (entity.ownerId === undefined) return;
    // Owner can access
    if (entity.ownerId === user.id) return;
    // Admin/superadmin can access
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN) return;
    // Check direct share on media
    const hasDirectShare: boolean = await this.mediaService.canAccess(user.id, entity.id);

    if (hasDirectShare) return;
    // Check share via collection hierarchy
    let hasCollectionShare = false;

    if (entity.collectionId) {
      hasCollectionShare = await this.collectionsService.canAccess(user.id, entity.collectionId);
    }

    if (hasCollectionShare) return;

    throw new ForbiddenException('You do not have access to this media');
  }

  private assertOwnerOrAdmin(entity: MediaEntity, user: UserEntity): void {
    if (entity.ownerId === user.id) return;
    if (user.role === UserRole.ADMIN || user.role === UserRole.SUPERADMIN) return;
    throw new ForbiddenException('Only the owner or an admin can modify this media');
  }

  private toResponse(entity: MediaEntity): MediaModel {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      url: this.mediaService.getStreamUrl(entity),
      thumbnailUrl: this.mediaService.getThumbnailUrl(entity),
      duration: entity.duration,
      fileSize: entity.fileSize,
      mimeType: entity.mimeType,
      resolution: entity.resolution,
      createdAt: entity.createdAt.toISOString(),
      viewCount: entity.viewCount,
      ownerId: entity.ownerId,
      ownerName: entity.owner?.name,
      collectionId: entity.collectionId,
      tags: this.mediaService.parseTags(entity),
    };
  }
}
