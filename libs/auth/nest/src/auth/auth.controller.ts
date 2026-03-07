import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { AuthResponse, RegistrationConfigResponse, UserResponse } from '@auth-lib/common';
import { AuthService } from './auth.service';
import { PublicApi } from './auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthRequest } from './auth.types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @PublicApi()
  @Get('registration-config')
  getRegistrationConfig(): RegistrationConfigResponse {
    return this.authService.getRegistrationConfig();
  }

  @PublicApi()
  @Post('register')
  async register(@Body() body: RegisterDto, @Req() req: Request): Promise<AuthResponse> {
    const result: AuthResponse = await this.authService.register(
      body.email,
      body.password,
      body.name,
      body.inviteToken,
    );
    req.session.userId = result.user.id;
    return result;
  }

  @PublicApi()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: LoginDto, @Req() req: Request): Promise<AuthResponse> {
    const result: AuthResponse = await this.authService.login(body.email, body.password);
    req.session.userId = result.user.id;
    return result;
  }

  @PublicApi()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Req() req: Request): Promise<{ message: string }> {
    return new Promise((resolve, reject) => {
      req.session.destroy((err: Error | undefined) => {
        if (err) {
          reject(err);
        } else {
          resolve({ message: 'Logged out successfully' });
        }
      });
    });
  }

  @Get('me')
  async me(@Req() req: AuthRequest): Promise<UserResponse> {
    if (!req.user) {
      throw new UnauthorizedException();
    }

    return req.user;
  }
}
