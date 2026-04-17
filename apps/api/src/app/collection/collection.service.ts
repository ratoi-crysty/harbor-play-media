import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { CollectionEntity } from './collection.entity';
import { FindOptionsWhere } from 'typeorm/find-options/FindOptionsWhere';
import { ShareService } from '../share/share.service';
import { ShareResourceType } from '@harbor-play-media/shared-api';

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
  constructor(
    @InjectRepository(CollectionEntity)
    private readonly repository: Repository<CollectionEntity>,
    private readonly shareService: ShareService,
  ) {}

  async findForUser(userId: number, parentId?: string): Promise<CollectionEntity[]> {
    const where: FindOptionsWhere<CollectionEntity> = { ownerId: userId };

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

  async findAllForUser(userId: number): Promise<CollectionEntity[]> {
    return this.repository.find({
      where: { ownerId: userId },
      order: { name: 'ASC' },
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

    Object.assign(entity, params);

    await this.repository.save(entity);

    return this.getById(id);
  }

  async delete(id: string): Promise<void> {
    const entity: CollectionEntity = await this.getById(id);

    await this.repository.remove(entity);
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

  async canAccess(userId: number, id: string): Promise<boolean> {
    const entity = await this.getById(id);

    const hasAccess = await this.shareService.canAccess(userId, ShareResourceType.COLLECTION, id);

    if (hasAccess) {
      return true;
    }

    if (!entity.parentId) {
      return false;
    }

    return this.canAccess(userId, entity.parentId);
  }
}
