import { UserRole, UserStatus } from './user.enum';

export interface UserModel {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
}
