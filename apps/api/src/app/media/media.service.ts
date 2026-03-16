import * as path from 'node:path';
import { mkdir, rename, unlink } from 'node:fs/promises';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import Bugsnag from '@bugsnag/node';
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
  private readonly logger = new Logger(MediaService.name);

  constructor(
    @InjectRepository(MediaEntity)
    private readonly repository: Repository<MediaEntity>,
    private readonly metadataService: MediaMetadataService,
  ) {}

  async findAll(): Promise<MediaEntity[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  async findById(id: string): Promise<MediaEntity | undefined> {
    const entity: MediaEntity | null = await this.repository.findOne({ where: { id } });

    return entity ?? undefined;
  }

  async getById(id: string): Promise<MediaEntity> {
    const entity: MediaEntity | undefined = await this.findById(id);

    if (!entity) {
      throw new NotFoundException(`Media with id ${id} not found`);
    }
    return entity;
  }

  async incrementViewCount(id: string): Promise<void> {
    await this.repository.increment({ id }, 'viewCount', 1);
  }

  async create(params: CreateMediaParams): Promise<MediaEntity> {
    await this.ensureUploadsDir();

    const { title, description, mediaFile, thumbnailFile } = params;

    // Rename uploaded file to uuid-based name
    const ext: string = path.extname(mediaFile.originalname);
    const newFileName = `${uuidv4()}${ext}`;
    const newFilePath: string = path.join(environment.uploadsPath, newFileName);
    await rename(mediaFile.path, newFilePath);

    // Handle thumbnail
    let thumbnailPath: string | null = null;
    if (thumbnailFile) {
      const thumbExt: string = path.extname(thumbnailFile.originalname);
      const thumbFileName = `${uuidv4()}${thumbExt}`;
      const thumbFilePath: string = path.join(environment.uploadsPath, thumbFileName);
      await rename(thumbnailFile.path, thumbFilePath);
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
      } catch (err: unknown) {
        this.logger.warn('Thumbnail generation failed', err);
        this.notifyBugsnag(err, 'thumbnail-generation');
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

    return this.repository.save(entity);
  }

  async delete(id: string): Promise<void> {
    const entity: MediaEntity = await this.getById(id);
    await this.repository.remove(entity);

    await unlink(entity.filePath).catch((err: unknown) => this.notifyBugsnag(err, 'file-deletion'));
    if (entity.thumbnailPath) {
      await unlink(entity.thumbnailPath).catch((err: unknown) => this.notifyBugsnag(err, 'thumbnail-deletion'));
    }
  }

  getStreamUrl(entity: MediaEntity): string {
    return `/api/media/${entity.id}/stream`;
  }

  getThumbnailUrl(entity: MediaEntity): string {
    return entity.thumbnailPath ? `/api/media/${entity.id}/thumbnail` : '';
  }

  private notifyBugsnag(error: unknown, context: string): void {
    if (!Bugsnag.isStarted()) return;
    const err: Error = error instanceof Error ? error : new Error(String(error));
    Bugsnag.notify(err, (event) => {
      event.context = context;
    });
  }

  private async ensureUploadsDir(): Promise<void> {
    await mkdir(environment.uploadsPath, { recursive: true });
  }
}
