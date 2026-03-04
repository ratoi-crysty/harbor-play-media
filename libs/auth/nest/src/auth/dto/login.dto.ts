import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginRequest } from '@harbor-play-media/common';

export class LoginDto implements LoginRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
