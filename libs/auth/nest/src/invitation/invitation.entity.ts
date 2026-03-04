import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../user/user.entity';

@Entity('invitations')
export class Invitation {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  token!: string;

  @Column()
  email!: string;

  @Column({ default: false })
  used!: boolean;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @Column()
  createdById!: number;

  @CreateDateColumn()
  createdAt!: Date;

  @Column()
  expiresAt!: Date;
}
