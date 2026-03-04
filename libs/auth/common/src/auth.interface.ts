import { RegistrationMode, UserRole, UserStatus } from './user.enum';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  inviteToken?: string;
}

export interface UserResponse extends Omit<RegisterRequest, 'password' | 'inviteToken'> {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}

export interface AuthResponse {
  user: UserResponse;
  message: string;
}

export interface RegistrationConfigResponse {
  mode: RegistrationMode;
}
