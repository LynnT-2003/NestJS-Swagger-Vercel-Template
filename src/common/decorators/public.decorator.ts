import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

// Usage: @Public() on any route to skip JwtGuard
// JwtGuard checks for this metadata before enforcing authentication
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);