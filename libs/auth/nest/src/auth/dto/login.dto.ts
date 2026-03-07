import { IsEmail, IsString, MinLength } from 'class-validator';
import { LoginRequest } from '@auth-lib/common';

export class LoginDto implements LoginRequest {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}
