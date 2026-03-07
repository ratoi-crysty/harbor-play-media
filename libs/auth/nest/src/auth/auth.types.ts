import 'express-session';
import { Request } from 'express';
import { UserEntity } from '../user';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export interface AuthRequest extends Request {
  user?: UserEntity;
}
