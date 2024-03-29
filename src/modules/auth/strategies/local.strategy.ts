import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserEntity } from '../../master_user/entities';
import { AuthService } from '../services';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(private readonly _authService: AuthService) {
    super({ usernameField: 'identifier', passwordField: 'password' });
  }

  public async validate(
    identifier: string,
    password: string,
    ac_type: string,
    email_master?: string,
  ): Promise<UserEntity> {
    const user = await this._authService.validateUser({
      identifier,
      password,
      ac_type,
      email_master,
    });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}
