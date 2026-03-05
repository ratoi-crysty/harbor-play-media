export interface SessionModel {
  id: string;
  json: string;
  expiredAt: number;
  destroyedAt?: Date;
}
