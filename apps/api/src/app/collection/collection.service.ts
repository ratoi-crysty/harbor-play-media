import { unlink } from 'node:fs/promises';
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import Bugsnag from '@bugsnag/node';
import { CollectionEntity } from './collection.entity';
import { MediaEntity } from '../media/media.entity';

export interface CreateCollectionParams {
  name: string;
  description: string;
  parentId?: string;
  ownerId: number;
  thumbnailPath?: string;
}

export interface UpdateCollectionParams {
  name?: string;
  description?: string;
  thumbnailPath?: string;
}

@Injectable()
export class CollectionService {
  private readonly logger: Logger = new Logger(CollectionService.name);

  constructor(
    @InjectRepository(CollectionEntity)
    private readonly repository: Repository<CollectionEntity>,
    @InjectRepository(MediaEntity)
    private readonly mediaRepository: Repository<MediaEntity>,
  ) {}

  async findForUser(userId: number, parentId?: string): Promise<CollectionEntity[]> {
    const where: Record<string, unknown> = { ownerId: userId };
    if (parentId) {
      where['parentId'] = parentId;
    } else {
      where['parentId'] = IsNull();
    }

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
      relations: ['media'],
    });
  }

  async findById(id: string): Promise<CollectionEntity | undefined> {
    const entity: CollectionEntity | null = await this.repository.findOne({
      where: { id },
      relations: ['children', 'media', 'media.uploadedBy'],
    });
    return entity ?? undefined;
  }

  async getById(id: string): Promise<CollectionEntity> {
    const entity: CollectionEntity | undefined = await this.findById(id);
    if (!entity) {
      throw new NotFoundException(`Collection with id ${id} not found`);
    }
    return entity;
  }

  async getOrCreateDefault(userId: number): Promise<CollectionEntity> {
    const existing: CollectionEntity | null = await this.repository.findOne({
      where: { ownerId: userId, parentId: IsNull(), name: 'My Media' },
    });

    if (existing) return existing;

    const entity: CollectionEntity = this.repository.create({
      name: 'My Media',
      description: 'Your default media collection',
      ownerId: userId,
    });

    return this.repository.save(entity);
  }

  async create(params: CreateCollectionParams): Promise<CollectionEntity> {
    const entity: CollectionEntity = this.repository.create({
      name: params.name,
      description: params.description,
      parentId: params.parentId,
      ownerId: params.ownerId,
      thumbnailPath: params.thumbnailPath,
    });

    const saved: CollectionEntity = await this.repository.save(entity);
    return this.getById(saved.id);
  }

  async update(id: string, params: UpdateCollectionParams): Promise<CollectionEntity> {
    const entity: CollectionEntity = await this.getById(id);

    if (params.name !== undefined) entity.name = params.name;
    if (params.description !== undefined) entity.description = params.description;
    if (params.thumbnailPath !== undefined) entity.thumbnailPath = params.thumbnailPath;

    await this.repository.save(entity);
    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const entity: CollectionEntity = await this.getById(id);
    await this.deleteRecursive(entity);
  }

  async move(id: string, newParentId: string | undefined): Promise<CollectionEntity> {
    const entity: CollectionEntity = await this.getById(id);
    entity.parentId = newParentId;
    await this.repository.save(entity);
    return this.getById(id);
  }

  getThumbnailUrl(entity: CollectionEntity): string {
    if (entity.thumbnailPath) {
      return `/api/collections/${entity.id}/thumbnail`;
    }
    return '';
  }

  private async deleteRecursive(entity: CollectionEntity): Promise<void> {
    // Load children if not loaded
    const full: CollectionEntity = await this.repository.findOne({
      where: { id: entity.id },
      relations: ['children', 'media'],
    }) as CollectionEntity;

    // Recursively delete children
    for (const child of full.children ?? []) {
      await this.deleteRecursive(child);
    }

    // Delete media files
    for (const media of full.media ?? []) {
      await unlink(media.filePath).catch((err: unknown) => this.notifyBugsnag(err, 'file-deletion'));
      if (media.thumbnailPath) {
        await unlink(media.thumbnailPath).catch((err: unknown) => this.notifyBugsnag(err, 'thumbnail-deletion'));
      }
      await this.mediaRepository.remove(media);
    }

    // Delete collection thumbnail
    if (full.thumbnailPath) {
      await unlink(full.thumbnailPath).catch((err: unknown) => this.notifyBugsnag(err, 'collection-thumbnail-deletion'));
    }

    await this.repository.remove(full);
  }

  private notifyBugsnag(error: unknown, context: string): void {
    if (!Bugsnag.isStarted()) return;
    const err: Error = error instanceof Error ? error : new Error(String(error));
    Bugsnag.notify(err, (event) => {
      event.context = context;
    });
  }
}
