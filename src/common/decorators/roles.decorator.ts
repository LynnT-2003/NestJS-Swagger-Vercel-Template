import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export const ROLES_KEY = 'roles';

// Usage: @Roles(UserRole.ADMIN) on any route
// RolesGuard reads this metadata and compares against req.user.role
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);