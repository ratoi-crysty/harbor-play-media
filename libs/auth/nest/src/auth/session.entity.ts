import { SessionModel } from '@auth-lib/common';
import { Exclude } from 'class-transformer';
import { ISession } from 'connect-typeorm';
import { Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('sessions')
export class SessionEntity implements ISession, SessionModel {
  @PrimaryColumn('varchar', { length: 255 })
  id!: string;

  @Exclude()
  @Column('text')
  json!: string;

  @Index()
  @Column('bigint')
  expiredAt!: number;

  @DeleteDateColumn()
  destroyedAt?: Date;
}
