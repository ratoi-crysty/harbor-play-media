import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { UserRole, UserStatus } from '@auth-lib/common';
import { UserService, UserEntity } from '../user';

@Injectable()
export class UserManagementService {
  constructor(private readonly userService: UserService) {}

  async findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  async updateRole(userId: number, newRole: UserRole, currentUser: UserEntity): Promise<UserEntity> {
    if (userId === currentUser.id) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const user: UserEntity | null = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.role === UserRole.SUPERADMIN && newRole !== UserRole.SUPERADMIN) {
      const superadminCount: number = await this.userService.countByRole(UserRole.SUPERADMIN);
      if (superadminCount <= 1) {
        throw new BadRequestException('Cannot demote the last superadmin');
      }
    }

    const updatedUser: UserEntity | null = await this.userService.updateRole(userId, newRole);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }

  async confirmUser(userId: number): Promise<UserEntity> {
    const user: UserEntity | null = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== UserStatus.AWAITING_CONFIRMATION) {
      throw new BadRequestException('User is not awaiting confirmation');
    }

    const updatedUser: UserEntity | null = await this.userService.updateStatus(userId, UserStatus.REGISTERED);

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return updatedUser;
  }
}
