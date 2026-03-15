import * as fs from 'fs';
import * as path from 'path';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { MediaModel } from '@harbor-play-media/shared-api';
import { MediaEntity } from './media.entity';
import { MediaMetadataService } from './media-metadata.service';
import { environment } from '../../environments/environment';

export interface CreateMediaParams {
  title: string;
  description: string;
  mediaFile: Express.Multer.File;
  thumbnailFile?: Express.Multer.File;
}

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaEntity)
    private readonly repository: Repository<MediaEntity>,
    private readonly metadataService: MediaMetadataService,
  ) {
    fs.mkdirSync(environment.uploadsPath, { recursive: true });
  }

  async findAll(): Promise<MediaModel[]> {
    const entities: MediaEntity[] = await this.repository.find({ order: { createdAt: 'DESC' } });
    return entities.map((e: MediaEntity) => this.toResponse(e));
  }

  async findByIdOrThrow(id: string): Promise<MediaEntity> {
    const entity: MediaEntity | null = await this.repository.findOne({ where: { id } });
    if (!entity) {
      throw new NotFoundException(`Media with id ${id} not found`);
    }
    return entity;
  }

  async getById(id: string): Promise<MediaModel> {
    const entity: MediaEntity = await this.findByIdOrThrow(id);
    return this.toResponse(entity);
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'viewCount', 1);
  }

  async create(params: CreateMediaParams): Promise<MediaModel> {
    const { title, description, mediaFile, thumbnailFile } = params;

    // Rename uploaded file to uuid-based name
    const ext: string = path.extname(mediaFile.originalname);
    const newFileName = `${uuidv4()}${ext}`;
    const newFilePath: string = path.join(environment.uploadsPath, newFileName);
    fs.renameSync(mediaFile.path, newFilePath);

    // Handle thumbnail
    let thumbnailPath: string | null = null;
    if (thumbnailFile) {
      const thumbExt: string = path.extname(thumbnailFile.originalname);
      const thumbFileName = `${uuidv4()}${thumbExt}`;
      const thumbFilePath: string = path.join(environment.uploadsPath, thumbFileName);
      fs.renameSync(thumbnailFile.path, thumbFilePath);
      thumbnailPath = thumbFilePath;
    }

    // Extract metadata
    const metadata = await this.metadataService.extractMetadata(newFilePath);

    // Auto-generate thumbnail if none provided
    if (!thumbnailPath) {
      try {
        const thumbFileName = `${uuidv4()}.jpg`;
        const thumbFilePath: string = path.join(environment.uploadsPath, thumbFileName);
        await this.metadataService.generateThumbnail(newFilePath, thumbFilePath);
        thumbnailPath = thumbFilePath;
      } catch {
        // Thumbnail generation failed — leave as null
      }
    }

    const entity: MediaEntity = this.repository.create({
      title,
      description,
      filePath: newFilePath,
      thumbnailPath,
      duration: metadata.duration,
      fileSize: metadata.fileSize,
      mimeType: metadata.mimeType,
      resolution: metadata.resolution,
      viewCount: 0,
    });

    const saved: MediaEntity = await this.repository.save(entity);
    return this.toResponse(saved);
  }

  async delete(id: string): Promise<void> {
    const entity: MediaEntity = await this.findByIdOrThrow(id);
    await this.repository.remove(entity);

    fs.unlink(entity.filePath, () => undefined);
    if (entity.thumbnailPath) {
      fs.unlink(entity.thumbnailPath, () => undefined);
    }
  }

  private toResponse(entity: MediaEntity): MediaModel {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      url: `/api/media/${entity.id}/stream`,
      thumbnailUrl: entity.thumbnailPath ? `/api/media/${entity.id}/thumbnail` : '',
      duration: entity.duration,
      fileSize: entity.fileSize,
      mimeType: entity.mimeType,
      resolution: entity.resolution,
      createdAt: entity.createdAt.toISOString(),
      viewCount: entity.viewCount,
    };
  }
}
