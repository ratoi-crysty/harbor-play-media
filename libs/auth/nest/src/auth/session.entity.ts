import { SessionModel } from '@auth-lib/common';
import { ISession } from 'connect-typeorm';
import { Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('sessions')
export class SessionEntity implements ISession, SessionModel {
  @PrimaryColumn('varchar', { length: 255 })
  id!: string;

  @Column('text')
  json!: string;

  @Index()
  @Column('bigint')
  expiredAt!: number;

  @DeleteDateColumn()
  destroyedAt?: Date;
}
