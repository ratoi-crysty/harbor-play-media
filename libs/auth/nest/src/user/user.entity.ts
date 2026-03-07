import { UserModel, UserResponse, UserRole, UserStatus } from '@auth-lib/common';
import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('users')
export class UserEntity implements UserModel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  password!: string;

  @Column({
    type: 'varchar',
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({
    type: 'varchar',
    default: UserStatus.REGISTERED,
  })
  status!: UserStatus;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  toJSON(): UserResponse {
    return {
      id: this.id,
      email: this.email,
      name: this.name,
      role: this.role,
      status: this.status,
    };
  }
}
