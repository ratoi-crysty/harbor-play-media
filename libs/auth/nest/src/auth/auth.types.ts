import 'express-session';
import { Request } from 'express';
import { User } from '../user';

declare module 'express-session' {
  interface SessionData {
    userId: number;
  }
}

export interface AuthRequest extends Request {
  user?: User;
}
