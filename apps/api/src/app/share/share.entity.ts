import { ShareModel, SharePermission, ShareResourceType } from '@harbor-play-media/shared-api';
import { UserEntity } from '@auth-lib/nest';
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity('shares')
export class ShareEntity
  implements Omit<ShareModel, 'createdAt' | 'sharedWithUserEmail' | 'sharedWithUserName'>
{
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  resourceType!: ShareResourceType;

  @Column()
  resourceId!: string;

  @Column('int')
  sharedWithUserId!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  sharedWithUser!: UserEntity;

  @Column('int')
  sharedByUserId!: number;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  sharedByUser!: UserEntity;

  @Column({ type: 'varchar', default: SharePermission.VIEW_DOWNLOAD })
  permission!: SharePermission;

  @CreateDateColumn()
  createdAt!: Date;
}
