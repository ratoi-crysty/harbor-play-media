import { BadRequestException, ConflictException, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RegistrationMode, UserRole, UserStatus } from '@auth-lib/common';
import { AUTH_CONFIG } from './auth.config';
import { AuthService } from './auth.service';
import { InvitationService } from '../invitation';
import { UserService } from '../user';
import { UserEntity } from '../user/user.entity';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

function makeUser(overrides: Partial<UserEntity> = {}): UserEntity {
  const user = new UserEntity();
  user.id = 1;
  user.email = 'test@test.com';
  user.name = 'Test User';
  user.password = 'hashed_password';
  user.role = UserRole.USER;
  user.status = UserStatus.REGISTERED;
  user.createdAt = new Date();
  user.updatedAt = new Date();
  return Object.assign(user, overrides);
}

describe('AuthService', () => {
  let service: AuthService;
  let userService: jest.Mocked<UserService>;
  let invitationService: jest.Mocked<InvitationService>;

  async function createModule(registrationMode: RegistrationMode): Promise<void> {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByEmail: jest.fn(),
            findById: jest.fn(),
            countUsers: jest.fn(),
            create: jest.fn(),
          },
        },
        {
          provide: InvitationService,
          useValue: {
            findValidByTokenAndEmail: jest.fn(),
            markAsUsed: jest.fn(),
          },
        },
        {
          provide: AUTH_CONFIG,
          useValue: { registrationMode },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    userService = module.get(UserService);
    invitationService = module.get(InvitationService);
  }

  describe('register()', () => {
    beforeEach(async () => {
      await createModule(RegistrationMode.OPEN);
    });

    it('throws ConflictException if email already exists', async () => {
      userService.findByEmail.mockResolvedValue(makeUser());
      await expect(service.register('test@test.com', 'pass', 'Test')).rejects.toThrow(ConflictException);
    });

    it('first user always becomes SUPERADMIN with REGISTERED status', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.countUsers.mockResolvedValue(0);
      const createdUser = makeUser({ role: UserRole.SUPERADMIN, status: UserStatus.REGISTERED });
      userService.create.mockResolvedValue(createdUser);

      const result = await service.register('first@test.com', 'pass', 'First');

      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.SUPERADMIN, status: UserStatus.REGISTERED }),
      );
      expect(result.user.role).toBe(UserRole.SUPERADMIN);
    });

    it('OPEN mode: creates user with USER role and REGISTERED status', async () => {
      userService.findByEmail.mockResolvedValue(null);
      userService.countUsers.mockResolvedValue(5);
      const createdUser = makeUser({ role: UserRole.USER, status: UserStatus.REGISTERED });
      userService.create.mockResolvedValue(createdUser);

      const result = await service.register('new@test.com', 'pass', 'New');

      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: UserRole.USER, status: UserStatus.REGISTERED }),
      );
      expect(result.message).toBe('Registration successful');
    });

    it('CONFIRMATION mode: creates user with AWAITING_CONFIRMATION status', async () => {
      await createModule(RegistrationMode.CONFIRMATION);
      userService.findByEmail.mockResolvedValue(null);
      userService.countUsers.mockResolvedValue(5);
      const createdUser = makeUser({ status: UserStatus.AWAITING_CONFIRMATION });
      userService.create.mockResolvedValue(createdUser);

      const result = await service.register('new@test.com', 'pass', 'New');

      expect(userService.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: UserStatus.AWAITING_CONFIRMATION }),
      );
      expect(result.message).toBe('Registration pending approval');
    });

    it('INVITE mode (non-first): throws BadRequestException if no token provided', async () => {
      await createModule(RegistrationMode.INVITE);
      userService.findByEmail.mockResolvedValue(null);
      userService.countUsers.mockResolvedValue(5);

      await expect(service.register('new@test.com', 'pass', 'New')).rejects.toThrow(BadRequestException);
    });

    it('INVITE mode: throws BadRequestException if token invalid', async () => {
      await createModule(RegistrationMode.INVITE);
      userService.findByEmail.mockResolvedValue(null);
      userService.countUsers.mockResolvedValue(5);
      invitationService.findValidByTokenAndEmail.mockResolvedValue(null);

      await expect(service.register('new@test.com', 'pass', 'New', 'bad-token')).rejects.toThrow(BadRequestException);
    });

    it('INVITE mode: marks invitation as used and creates user', async () => {
      await createModule(RegistrationMode.INVITE);
      userService.findByEmail.mockResolvedValue(null);
      userService.countUsers.mockResolvedValue(5);
      const mockInvitation = { id: 42, token: 'valid-token', email: 'new@test.com' } as never;
      invitationService.findValidByTokenAndEmail.mockResolvedValue(mockInvitation);
      invitationService.markAsUsed.mockResolvedValue(undefined);
      userService.create.mockResolvedValue(makeUser());

      await service.register('new@test.com', 'pass', 'New', 'valid-token');

      expect(invitationService.markAsUsed).toHaveBeenCalledWith(42);
      expect(userService.create).toHaveBeenCalled();
    });
  });

  describe('login()', () => {
    beforeEach(async () => {
      await createModule(RegistrationMode.OPEN);
    });

    it('throws UnauthorizedException if user not found', async () => {
      userService.findByEmail.mockResolvedValue(null);
      await expect(service.login('test@test.com', 'pass')).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException if password wrong', async () => {
      userService.findByEmail.mockResolvedValue(makeUser());
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(service.login('test@test.com', 'wrongpass')).rejects.toThrow(UnauthorizedException);
    });

    it('throws ForbiddenException if user is AWAITING_CONFIRMATION', async () => {
      userService.findByEmail.mockResolvedValue(makeUser({ status: UserStatus.AWAITING_CONFIRMATION }));
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      await expect(service.login('test@test.com', 'pass')).rejects.toThrow(ForbiddenException);
    });

    it('returns AuthResponse on success', async () => {
      const user = makeUser();
      userService.findByEmail.mockResolvedValue(user);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login('test@test.com', 'pass');

      expect(result.user).toBe(user);
      expect(result.message).toBe('Login successful');
    });
  });

  describe('getUser()', () => {
    beforeEach(async () => {
      await createModule(RegistrationMode.OPEN);
    });

    it('throws UnauthorizedException if user not found', async () => {
      userService.findById.mockResolvedValue(null);
      await expect(service.getUser(999)).rejects.toThrow(UnauthorizedException);
    });

    it('returns user on success', async () => {
      const user = makeUser();
      userService.findById.mockResolvedValue(user);
      const result = await service.getUser(1);
      expect(result).toBe(user);
    });
  });

  describe('getRegistrationConfig()', () => {
    it('returns the configured registration mode', async () => {
      await createModule(RegistrationMode.INVITE);
      const result = service.getRegistrationConfig();
      expect(result.mode).toBe(RegistrationMode.INVITE);
    });
  });
});
