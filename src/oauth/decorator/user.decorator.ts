import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '../guard/auth.guard';

export const User = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) =>
    (AuthGuard.getRequestFromContext(ctx) as any).user,
);
