import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RoleType } from '../../master_user/constants';
import { JwtAccessTokenGuard, RolesGuard, EmailConfirmationGuard } from '../guards';


export function Authorization(...roles: RoleType[]) {
  return applyDecorators(
    SetMetadata('roles', roles),
    UseGuards(JwtAccessTokenGuard, RolesGuard, EmailConfirmationGuard),
  );
}
