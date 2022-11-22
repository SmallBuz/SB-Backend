import { SetMetadata } from '@nestjs/common';
import { RoleType } from '../../master_user/constants';


export const Roles = (...roles: RoleType[]) => SetMetadata('roles', roles);
