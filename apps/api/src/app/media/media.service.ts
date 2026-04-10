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
  uploadedByUserId?: number;
  collectionId?: string;
  tags?: string[];
}

export interface UpdateMediaParams {
  title?: string;
  description?: string;
  tags?: string[];
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
    return this.repository.find({ order: { createdAt: 'DESC' }, relations: ['uploadedBy'] });
  }

  async findForUser(userId: number): Promise<MediaEntity[]> {
    return this.repository.find({
      where: [{ uploadedByUserId: userId }, { uploadedByUserId: undefined as unknown as number }],
      order: { createdAt: 'DESC' },
      relations: ['uploadedBy'],
    });
  }

  async findById(id: string): Promise<MediaEntity | undefined> {
    const entity: MediaEntity | null = await this.repository.findOne({
      where: { id },
      relations: ['uploadedBy'],
    });

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

    const { title, description, mediaFile, thumbnailFile, uploadedByUserId, collectionId, tags } = params;

    // Rename uploaded file to uuid-based name
    const newFilePath: string = await this.renameFile(mediaFile.originalname, mediaFile.path);

    // Handle thumbnail
    let thumbnailPath: string | undefined;
    if (thumbnailFile) {
      thumbnailPath = await this.renameFile(mediaFile.originalname, thumbnailFile.path);
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
      uploadedByUserId,
      collectionId,
      tagsRaw: tags?.join(',') ?? '',
    });

    const saved: MediaEntity = await this.repository.save(entity);
    return this.findById(saved.id) as Promise<MediaEntity>;
  }

  async update(id: string, params: UpdateMediaParams): Promise<MediaEntity> {
    const entity: MediaEntity = await this.getById(id);

    if (params.title !== undefined) {
      entity.title = params.title;
    }
    if (params.description !== undefined) {
      entity.description = params.description;
    }
    if (params.tags !== undefined) {
      entity.tagsRaw = params.tags.join(',');
    }

    await this.repository.save(entity);
    return this.getById(id);
  }

  async incrementViewCountIfNew(id: string, viewedMediaIds: string[]): Promise<string[]> {
    if (!viewedMediaIds.includes(id)) {
      await this.repository.increment({ id }, 'viewCount', 1);
      return [...viewedMediaIds, id];
    }
    return viewedMediaIds;
  }

  async moveToCollection(id: string, collectionId: string | undefined): Promise<MediaEntity> {
    const entity: MediaEntity = await this.getById(id);
    entity.collectionId = collectionId;
    await this.repository.save(entity);
    return this.getById(id);
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

  parseTags(entity: MediaEntity): string[] {
    return entity.tagsRaw ? entity.tagsRaw.split(',').map((t: string) => t.trim()).filter(Boolean) : [];
  }

  private async renameFile(fileName: string, filePath: string): Promise<string> {
    const ext: string = path.extname(fileName);
    const newFileName = `${uuidv4()}${ext}`;
    const newFilePath: string = path.join(environment.uploadsPath, newFileName);
    await rename(filePath, newFilePath);

    return newFilePath;
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
