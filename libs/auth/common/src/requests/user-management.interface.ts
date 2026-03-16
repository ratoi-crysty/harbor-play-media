import { UserRole } from '../models/user.enum';
import { UserModel } from '../models/user.model';

export interface UserListItem extends UserModel {
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

export type UserListResponse = UserListItem[];
