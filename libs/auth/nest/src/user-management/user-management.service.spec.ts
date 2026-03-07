import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, UserStatus } from '@auth-lib/common';
import { UserManagementService } from './user-management.service';
import { UserService } from '../user';
import { UserEntity } from '../user/user.entity';

function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  const user = new UserEntity();
  user.id = 1;
  user.email = 'test@test.com';
  user.name = 'Test User';
  user.password = 'hashed';
  user.role = UserRole.USER;
  user.status = UserStatus.REGISTERED;
  user.createdAt = new Date('2024-01-01');
  user.updatedAt = new Date('2024-01-01');
  return Object.assign(user, overrides);
}

describe('UserManagementService', () => {
  let service: UserManagementService;
  let userService: jest.Mocked<UserService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserManagementService,
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn(),
            findById: jest.fn(),
            countByRole: jest.fn(),
            updateRole: jest.fn(),
            updateStatus: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(UserManagementService);
    userService = module.get(UserService);
  });

  describe('findAll()', () => {
    it('returns mapped list items', async () => {
      const users = [
        makeUser({ id: 1, email: 'a@test.com' }),
        makeUser({ id: 2, email: 'b@test.com' }),
      ];
      userService.findAll.mockResolvedValue(users);

      const result = await service.findAll();

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(1);
      expect(result[0].email).toBe('a@test.com');
      expect(result[1].id).toBe(2);
    });
  });

  describe('updateRole()', () => {
    const currentUser = makeUser({ id: 10, role: UserRole.SUPERADMIN });

    it('throws ForbiddenException if updating own role', async () => {
      await expect(service.updateRole(10, UserRole.ADMIN, currentUser)).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException if user not found', async () => {
      userService.findById.mockResolvedValue(null);
      await expect(service.updateRole(99, UserRole.ADMIN, currentUser)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException when demoting last SUPERADMIN', async () => {
      const target = makeUser({ id: 2, role: UserRole.SUPERADMIN });
      userService.findById.mockResolvedValue(target);
      userService.countByRole.mockResolvedValue(1);

      await expect(service.updateRole(2, UserRole.ADMIN, currentUser)).rejects.toThrow(BadRequestException);
    });

    it('updates role successfully when multiple superadmins exist', async () => {
      const target = makeUser({ id: 2, role: UserRole.SUPERADMIN });
      const updated = makeUser({ id: 2, role: UserRole.ADMIN });
      userService.findById.mockResolvedValue(target);
      userService.countByRole.mockResolvedValue(2);
      userService.updateRole.mockResolvedValue(updated);

      const result = await service.updateRole(2, UserRole.ADMIN, currentUser);

      expect(result.role).toBe(UserRole.ADMIN);
    });
  });

  describe('confirmUser()', () => {
    it('throws NotFoundException if user not found', async () => {
      userService.findById.mockResolvedValue(null);
      await expect(service.confirmUser(999)).rejects.toThrow(NotFoundException);
    });

    it('throws BadRequestException if user not awaiting confirmation', async () => {
      userService.findById.mockResolvedValue(makeUser({ status: UserStatus.REGISTERED }));
      await expect(service.confirmUser(1)).rejects.toThrow(BadRequestException);
    });

    it('confirms user successfully', async () => {
      const user = makeUser({ status: UserStatus.AWAITING_CONFIRMATION });
      const confirmed = makeUser({ status: UserStatus.REGISTERED });
      userService.findById.mockResolvedValue(user);
      userService.updateStatus.mockResolvedValue(confirmed);

      const result = await service.confirmUser(1);

      expect(userService.updateStatus).toHaveBeenCalledWith(1, UserStatus.REGISTERED);
      expect(result.status).toBe(UserStatus.REGISTERED);
    });
  });
});
