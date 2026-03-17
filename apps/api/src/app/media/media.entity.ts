import { MediaModel } from '@harbor-play-media/shared-api';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('media')
export class MediaEntity implements Omit<MediaModel, 'url' | 'thumbnailUrl' | 'createdAt'> {
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
}
