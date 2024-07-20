import { SetMetadata } from '@nestjs/common';
import { Roles as RoleType } from '../types/roles';

export const Roles = (...roles: RoleType[]) => SetMetadata('roles', roles);
