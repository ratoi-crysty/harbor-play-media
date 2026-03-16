import { InvitationModel } from '@auth-lib/common';
import { Exclude } from 'class-transformer';
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserEntity } from '../user';

@Entity('invitations')
export class InvitationEntity implements InvitationModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Exclude()
  @Column({ unique: true })
  token!: string;

  @Column()
  email!: string;

  @Column({ default: false })
  used!: boolean;

  @ManyToOne(() => UserEntity)
  @JoinColumn({ name: 'createdById' })
  createdBy!: UserEntity;

  @Column()
  createdById!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  expiresAt!: Date;
}
