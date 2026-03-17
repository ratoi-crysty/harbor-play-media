import * as fs from 'fs';
import * as path from 'path';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { MediaModel } from '@harbor-play-media/shared-api';
import { MediaEntity } from './media.entity';
import { MediaService } from './media.service';
import { CreateMediaDto } from './dto/create-media.dto';
import { environment } from '../../environments/environment';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Get()
  async findAll(): Promise<MediaModel[]> {
    const entities: MediaEntity[] = await this.mediaService.findAll();
    return entities.map((e: MediaEntity) => this.toResponse(e));
  }

  @Get(':id')
  async getById(@Param('id') id: string): Promise<MediaModel> {
    const entity: MediaEntity = await this.mediaService.getById(id);
    await this.mediaService.incrementViewCount(id);
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
    });

    return this.toResponse(entity);
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

  @Delete(':id')
  @HttpCode(204)
  async delete(@Param('id') id: string): Promise<void> {
    await this.mediaService.delete(id);
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
    };
  }
}
