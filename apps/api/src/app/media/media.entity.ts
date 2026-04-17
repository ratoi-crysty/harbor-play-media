import { MediaModel } from '@harbor-play-media/shared-api';
import { UserEntity } from '@auth-lib/nest';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { CollectionEntity } from '../collection/collection.entity';

@Entity('media')
export class MediaEntity
  implements
    Omit<MediaModel, 'url' | 'thumbnailUrl' | 'createdAt' | 'uploadedByUserId' | 'uploadedByUserName' | 'collectionId' | 'tags'>
{
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column({ default: '' })
  description!: string;

  @Exclude()
  @Column()
  filePath!: string;

  @Exclude()
  @Column({ nullable: true, type: 'varchar' })
  thumbnailPath!: string | null;

  @Column('float')
  duration!: number;

  @Column('int')
  fileSize!: number;

  @Column()
  mimeType!: string;

  @Column({ nullable: true, type: 'varchar' })
  resolution!: string | undefined;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: 0 })
  viewCount!: number;

  @Column({ nullable: true, type: 'int' })
  uploadedByUserId!: number | undefined;

  @ManyToOne(() => UserEntity, { nullable: true, onDelete: 'SET NULL' })
  uploadedBy!: UserEntity | undefined;

  @Column({ nullable: true, type: 'varchar' })
  collectionId!: string | undefined;

  @ManyToOne(() => CollectionEntity, 'media', { nullable: true, onDelete: 'SET NULL' })
  collection!: CollectionEntity;

  @Column({ default: '' })
  tagsRaw!: string;
}
