import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ICurrentUser } from '../interfaces/user.interface';

// Usage: @CurrentUser() user: ICurrentUser
// Extracts req.user which is set by JwtStrategy.validate()
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ICurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user as ICurrentUser;
  },
);