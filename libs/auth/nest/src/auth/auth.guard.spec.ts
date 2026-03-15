import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { UserRole, UserStatus } from '@auth-lib/common';
import { AuthGuard } from './auth.guard';
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
  user.createdAt = new Date();
  user.updatedAt = new Date();
  return Object.assign(user, overrides);
}

function makeContext(overrides: {
  isPublic?: boolean;
  userId?: number;
  roles?: UserRole[];
}): ExecutionContext {
  const { isPublic = false, userId = undefined, roles = undefined } = overrides;

  return {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        session: userId !== undefined ? { userId } : {},
      }),
    }),
    _isPublic: isPublic,
    _roles: roles,
  } as unknown as ExecutionContext;
}

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let userService: jest.Mocked<UserService>;
  let reflector: jest.Mocked<Reflector>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: UserService,
          useValue: {
            findById: jest.fn(),
          },
        },
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get(AuthGuard);
    userService = module.get(UserService);
    reflector = module.get(Reflector);
  });

  it('returns true if route is marked @PublicApi()', async () => {
    reflector.getAllAndOverride.mockImplementation((key: unknown) => {
      if (key === 'AuthGuard.Public') return true;
      return undefined;
    });
    const ctx = makeContext({ isPublic: true });
    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });

  it('throws UnauthorizedException if no session userId', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = makeContext({ userId: undefined });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException if user not found by session userId', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    userService.findById.mockResolvedValue(null);
    const ctx = makeContext({ userId: 999 });
    await expect(guard.canActivate(ctx)).rejects.toThrow(UnauthorizedException);
  });

  it('throws ForbiddenException if user role insufficient', async () => {
    reflector.getAllAndOverride.mockImplementation((key: unknown) => {
      if (key === 'AuthGuard.Roles') return [UserRole.ADMIN];
      return undefined;
    });
    userService.findById.mockResolvedValue(makeUser({ role: UserRole.USER }));
    const ctx = makeContext({ userId: 1 });
    await expect(guard.canActivate(ctx)).rejects.toThrow(ForbiddenException);
  });

  it('sets request.user and returns true on success', async () => {
    reflector.getAllAndOverride.mockImplementation((key: unknown) => {
      if (key === 'AuthGuard.Roles') return [UserRole.USER];
      return undefined;
    });
    const user = makeUser();
    userService.findById.mockResolvedValue(user);

    const request = { session: { userId: 1 } } as Record<string, unknown>;
    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);

    expect(result).toBe(true);
    expect(request['user']).toBe(user);
  });

  it('default required role is USER when no @Roles() decorator', async () => {
    reflector.getAllAndOverride.mockReturnValue(undefined);
    const user = makeUser({ role: UserRole.USER });
    userService.findById.mockResolvedValue(user);

    const request = { session: { userId: 1 } } as Record<string, unknown>;
    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue(request),
      }),
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(ctx);
    expect(result).toBe(true);
  });
});
