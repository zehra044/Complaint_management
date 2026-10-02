import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';
//"this route requires these roles."
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);