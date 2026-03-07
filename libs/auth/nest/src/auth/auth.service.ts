import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import {
  AuthResponse,
  RegistrationConfigResponse,
  RegistrationMode,
  UserResponse,
  UserRole,
  UserStatus,
} from '@auth-lib/common';
import { UserEntity, UserService } from '../user';
import { AUTH_CONFIG, AuthModuleConfig } from './auth.config';
import { InvitationService } from '../invitation';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly invitationService: InvitationService,
    @Inject(AUTH_CONFIG)
    private readonly authConfig: AuthModuleConfig,
  ) {}

  async register(email: string, password: string, name: string, inviteToken?: string): Promise<AuthResponse> {
    const existing: UserEntity | null = await this.userService.findByEmail(email);

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const mode: RegistrationMode = this.authConfig.registrationMode;
    const userCount: number = await this.userService.countUsers();
    const isFirstUser: boolean = userCount === 0;

    let role: UserRole = UserRole.USER;
    let status: UserStatus = UserStatus.REGISTERED;

    if (mode === RegistrationMode.INVITE && !isFirstUser) {
      if (!inviteToken) {
        throw new BadRequestException('Invite token is required');
      }

      const invitation = await this.invitationService.findValidByTokenAndEmail(inviteToken, email);

      if (!invitation) {
        throw new BadRequestException('Invalid or expired invite token');
      }

      await this.invitationService.markAsUsed(invitation.id);
    }

    if (mode === RegistrationMode.CONFIRMATION && !isFirstUser) {
      status = UserStatus.AWAITING_CONFIRMATION;
    }

    if (isFirstUser) {
      role = UserRole.SUPERADMIN;
      status = UserStatus.REGISTERED;
    }

    const hashedPassword: string = await bcrypt.hash(password, SALT_ROUNDS);
    const user: UserEntity = await this.userService.create({
      email,
      name,
      hashedPassword,
      role,
      status,
    });

    const message: string =
      status === UserStatus.AWAITING_CONFIRMATION ? 'Registration pending approval' : 'Registration successful';

    return {
      user: user,
      message,
    };
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const user: UserEntity | null = await this.userService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isValid: boolean = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status === UserStatus.AWAITING_CONFIRMATION) {
      throw new ForbiddenException(
        'Your account is pending approval. Please wait for an administrator to confirm your registration.',
      );
    }

    return {
      user: user,
      message: 'Login successful',
    };
  }

  async getUser(userId: number): Promise<UserResponse> {
    const user: UserEntity | null = await this.userService.findById(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user;
  }

  getRegistrationConfig(): RegistrationConfigResponse {
    const mode: RegistrationMode = this.authConfig.registrationMode;

    return {
      mode,
    };
  }
}
