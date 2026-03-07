export interface InvitationModel {
  id: number;
  token: string;
  email: string;
  used: boolean;
  createdById: number;
  createdAt: Date;
  expiresAt: Date;
}
