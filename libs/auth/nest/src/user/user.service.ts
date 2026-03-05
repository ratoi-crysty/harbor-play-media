import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserRole, UserStatus } from '@harbor-play-media/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';

export interface CreateUserOptions {
  email: string;
  name: string;
  hashedPassword: string;
  role?: UserRole;
  status?: UserStatus;
}

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async countUsers(): Promise<number> {
    return this.userRepository.count();
  }

  async countByRole(role: UserRole): Promise<number> {
    return this.userRepository.count({ where: { role } });
  }

  async create(options: CreateUserOptions): Promise<User> {
    const user: User = this.userRepository.create({
      email: options.email,
      name: options.name,
      password: options.hashedPassword,
      role: options.role ?? UserRole.USER,
      status: options.status ?? UserStatus.REGISTERED,
    });
    return this.userRepository.save(user);
  }

  async updateRole(id: number, role: UserRole): Promise<User | null> {
    await this.userRepository.update(id, { role });
    return this.findById(id);
  }

  async updateStatus(id: number, status: UserStatus): Promise<User | null> {
    await this.userRepository.update(id, { status });
    return this.findById(id);
  }
}
