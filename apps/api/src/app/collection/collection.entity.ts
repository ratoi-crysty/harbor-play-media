import { CollectionModel } from '@harbor-play-media/shared-api';
import { UserEntity } from '@auth-lib/nest';
import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { MediaEntity } from '../media/media.entity';

@Entity('collections')
export class CollectionEntity implements Omit<CollectionModel, 'createdAt' | 'thumbnailUrl' | 'itemCount'> {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ default: '' })
  description!: string;

  @Exclude()
  @Column({ nullable: true, type: 'varchar' })
  thumbnailPath!: string | undefined;

  @Column({ nullable: true, type: 'varchar' })
  parentId!: string | undefined;

  @ManyToOne(() => CollectionEntity, (c: CollectionEntity) => c.children, {
    nullable: true,
    onDelete: 'CASCADE',
  })
  parent!: CollectionEntity | undefined;

  @OneToMany(() => CollectionEntity, (c: CollectionEntity) => c.parent)
  children!: CollectionEntity[];

  @Column('int')
  ownerId!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  owner!: UserEntity;

  @OneToMany(() => MediaEntity, (m: MediaEntity) => m.collection)
  media!: MediaEntity[];

  @CreateDateColumn()
  createdAt!: Date;
}
