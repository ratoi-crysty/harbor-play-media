import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { RegisterRequest } from '@harbor-play-media/common';

export class RegisterDto implements RegisterRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @MinLength(1)
  name!: string;

  @IsOptional()
  @IsString()
  inviteToken?: string;
}
