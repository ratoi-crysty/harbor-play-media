import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthRequest } from './auth.types';
import { UserEntity } from '../user';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): UserEntity | undefined => ctx.switchToHttp().getRequest<AuthRequest>().user,
);
