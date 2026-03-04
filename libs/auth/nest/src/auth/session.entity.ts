import { ISession } from 'connect-typeorm';
import { Column, DeleteDateColumn, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity('sessions')
export class Session implements ISession {
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
