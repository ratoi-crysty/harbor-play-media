import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SharePermission, ShareResourceType } from '@harbor-play-media/shared-api';
import { UserService } from '@auth-lib/nest';
import { ShareEntity } from './share.entity';
import { CollectionEntity } from '../collection/collection.entity';

@Injectable()
export class ShareService {
  constructor(
    @InjectRepository(ShareEntity)
    private readonly repository: Repository<ShareEntity>,
    @InjectRepository(CollectionEntity)
    private readonly collectionRepository: Repository<CollectionEntity>,
    private readonly userService: UserService,
  ) {}

  async createShare(
    resourceType: ShareResourceType,
    resourceId: string,
    email: string,
    sharedByUserId: number,
  ): Promise<ShareEntity> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.id === sharedByUserId) {
      throw new BadRequestException('Cannot share with yourself');
    }

    // Check if share already exists
    const existing: ShareEntity | null = await this.repository.findOne({
      where: {
        resourceType,
        resourceId,
        sharedWithUserId: user.id,
      },
    });

    if (existing) {
      return existing;
    }

    const entity: ShareEntity = this.repository.create({
      resourceType,
      resourceId,
      sharedWithUserId: user.id,
      sharedByUserId,
      permission: SharePermission.VIEW_DOWNLOAD,
    });

    const saved: ShareEntity = await this.repository.save(entity);
    return this.getById(saved.id);
  }

  async getById(id: string): Promise<ShareEntity> {
    const entity: ShareEntity | null = await this.repository.findOne({
      where: { id },
      relations: ['sharedWithUser', 'sharedByUser'],
    });

    if (!entity) {
      throw new NotFoundException(`Share with id ${id} not found`);
    }

    return entity;
  }

  async findForResource(resourceType: ShareResourceType, resourceId: string): Promise<ShareEntity[]> {
    return this.repository.find({
      where: { resourceType, resourceId },
      relations: ['sharedWithUser', 'sharedByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async findSharedWithUser(userId: number): Promise<ShareEntity[]> {
    return this.repository.find({
      where: { sharedWithUserId: userId },
      relations: ['sharedWithUser', 'sharedByUser'],
      order: { createdAt: 'DESC' },
    });
  }

  async revoke(id: string): Promise<void> {
    const entity: ShareEntity = await this.getById(id);
    await this.repository.remove(entity);
  }

  async canAccess(userId: number, resourceType: ShareResourceType, resourceId: string): Promise<boolean> {
    // Check direct share on this resource
    const directShare: ShareEntity | null = await this.repository.findOne({
      where: {
        resourceType,
        resourceId,
        sharedWithUserId: userId,
      },
    });

    if (directShare) return true;

    // For media, check if the collection (or any ancestor) is shared
    if (resourceType === ShareResourceType.MEDIA) {
      // We need to look up the media's collectionId
      // This is handled by the caller passing the collectionId
      return false;
    }

    // For collections, walk up the parent chain
    if (resourceType === ShareResourceType.COLLECTION) {
      return this.canAccessCollection(userId, resourceId);
    }

    return false;
  }

  async canAccessMedia(userId: number, mediaCollectionId: string | undefined): Promise<boolean> {
    if (!mediaCollectionId) return false;
    return this.canAccessCollection(userId, mediaCollectionId);
  }

  private async canAccessCollection(userId: number, collectionId: string): Promise<boolean> {
    const share: ShareEntity | null = await this.repository.findOne({
      where: {
        resourceType: ShareResourceType.COLLECTION,
        resourceId: collectionId,
        sharedWithUserId: userId,
      },
    });

    if (share) return true;

    // Walk up to parent
    const collection: CollectionEntity | null = await this.collectionRepository.findOne({
      where: { id: collectionId },
    });

    if (collection?.parentId) {
      return this.canAccessCollection(userId, collection.parentId);
    }

    return false;
  }
}
