import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from './auth.types';
import { User } from '../user/user.entity';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User | undefined => ctx.switchToHttp().getRequest<AuthRequest>().user,
);
