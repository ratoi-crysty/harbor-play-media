import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserListItem, UserRole, UserStatus } from '@harbor-play-media/common';
import { UserService, UserEntity } from '../user';

@Injectable()
export class UserManagementService {
  constructor(private readonly userService: UserService) {}

  async findAll(): Promise<UserListItem[]> {
    const users: UserEntity[] = await this.userService.findAll();
    return users.map((user) => this.toListItem(user));
  }

  async updateRole(
    userId: number,
    newRole: UserRole,
    currentUser: UserEntity
  ): Promise<UserListItem> {
    if (userId === currentUser.id) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const user: UserEntity | null = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (
      user.role === UserRole.SUPERADMIN &&
      newRole !== UserRole.SUPERADMIN
    ) {
      const superadminCount: number = await this.userService.countByRole(
        UserRole.SUPERADMIN
      );
      if (superadminCount <= 1) {
        throw new BadRequestException(
          'Cannot demote the last superadmin'
        );
      }
    }

    const updatedUser: UserEntity | null = await this.userService.updateRole(
      userId,
      newRole
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return this.toListItem(updatedUser);
  }

  async confirmUser(userId: number): Promise<UserListItem> {
    const user: UserEntity | null = await this.userService.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.status !== UserStatus.AWAITING_CONFIRMATION) {
      throw new BadRequestException('User is not awaiting confirmation');
    }

    const updatedUser: UserEntity | null = await this.userService.updateStatus(
      userId,
      UserStatus.REGISTERED
    );

    if (!updatedUser) {
      throw new NotFoundException('User not found');
    }

    return this.toListItem(updatedUser);
  }

  private toListItem(user: UserEntity): UserListItem {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      createdAt: user.createdAt,
    };
  }
}
