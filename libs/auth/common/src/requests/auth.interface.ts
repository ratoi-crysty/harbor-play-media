import { RegistrationMode } from '../models/user.enum';
import { UserModel } from '../models/user.model';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest extends LoginRequest {
  name: string;
  inviteToken?: string;
}

export type UserResponse = UserModel;

export interface AuthResponse {
  user: UserResponse;
  message: string;
}

export interface RegistrationConfigResponse {
  mode: RegistrationMode;
}
