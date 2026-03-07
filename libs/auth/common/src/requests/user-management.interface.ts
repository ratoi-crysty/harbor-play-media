import { UserRole, UserStatus } from '../models/user.enum';

export interface UserListItem {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
}

export interface UpdateUserRoleRequest {
  role: UserRole;
}

export interface CreateInvitationRequest {
  email: string;
}

export interface InvitationResponse {
  id: number;
  token: string;
  email: string;
  used: boolean;
  createdAt: Date;
  expiresAt: Date;
  createdBy: {
    id: number;
    name: string;
  };
}

export interface InvitationListResponse {
  invitations: InvitationResponse[];
}

export interface UserListResponse {
  users: UserListItem[];
}
