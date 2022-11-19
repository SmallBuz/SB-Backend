import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

import { UserRegistrationDto, UserLoginDto } from '../dtos';
import {
  RefreshTokenNotMatchingException,
  WrongCredentialsProvidedException,
} from '../exceptions';
import { TokenPayloadInterface, VerificationTokenPayload } from '../interfaces';
import { UserEntity } from '../../master_user/entities';
import { UserAuthService, UserService } from '../../master_user/services';
import { validateHash } from '../../../utils';
import { RoleType } from '../../../modules/master_user/constants';
import { POSDeviceService } from '../../../modules/pos_manager/pos_users/services/user_device.service';
@Injectable()
export class AuthService {
  constructor(
    private readonly _userService: UserService,
    private readonly _posDeviceService: POSDeviceService,
    private readonly _userAuthService: UserAuthService,
    private readonly _jwtService: JwtService,
    private readonly _configService: ConfigService,
  ) {}

  public async register(
    userRegistrationDto: UserRegistrationDto,
  ): Promise<string[]> {
    const user = await this._userService.createUser(userRegistrationDto);
    console.log('usessr:', await user);
    const data = await this._userService.getUserByMail(user.userAuth.email);
    console.log('patata1');
    const accessTokenCookie = await this._getCookieWithJwtToken(data.uuid);
    console.log('patata2');
    const { cookie: refreshTokenCookie, token: refreshToken } =
      this._getCookieWithJwtRefreshToken(data.uuid);

    await this._userAuthService.updateRefreshToken(
      data.userAuth.id,
      refreshToken,
    );
    console.log('patata3');
    console.log('tokens1', accessTokenCookie);
    console.log('tokens2', refreshTokenCookie);
    return [accessTokenCookie, refreshTokenCookie];
  }

  public async login(user: UserLoginDto): Promise<string[]> {
    if (user.ac_type === RoleType.MASTER_ACCOUNT) {
      console.log('chgheckp');
      const data = await this._userService.getUserByMail(user.identifier);

      const accessTokenCookie = await this._getCookieWithJwtToken(data.uuid);

      const { cookie: refreshTokenCookie, token: refreshToken } =
        this._getCookieWithJwtRefreshToken(data.uuid);

      await this._userAuthService.updateRefreshToken(
        data.userAuth.id,
        refreshToken,
      );
      return [accessTokenCookie, refreshTokenCookie];
    }
    if (user.ac_type === RoleType.POS_ACCOUNT) {
      console.log('chgheck');
      const checkRelation = await this._posDeviceService.getOneDeviceLogin(
        user,
      );
      console.log('checkre:', checkRelation);
      if (checkRelation) {
        console.log('relation');
        const data = await this._userService.getUserByMail(user.identifier);

        const accessTokenCookie = await this._getCookieWithJwtToken(data.uuid);

        const { cookie: refreshTokenCookie, token: refreshToken } =
          this._getCookieWithJwtRefreshToken(data.uuid);

        await this._userAuthService.updateRefreshToken(
          data.userAuth.id,
          refreshToken,
        );

        return [accessTokenCookie, refreshTokenCookie];
      }
    }
    console.log('chghec2k');
  }

  public async logout(user: UserEntity): Promise<void> {
    try {
      const response = await this._userAuthService.updateRefreshToken(
        user.userAuth.id,
        null,
      );
      console.log('update;', response);
    } catch (e) {
      console.log('aqui estoy2:', e);
    }
  }

  public async validateUser(userLoginDto: UserLoginDto): Promise<UserEntity> {
    const { identifier, password } = userLoginDto;
    const user = await this._userService.findUser({
      pinCode: +identifier,
      email: identifier,
      uuid: identifier,
    });
    console.log('pass1');
    if (!user) {
      throw new WrongCredentialsProvidedException();
    }

    const isPasswordValid = await validateHash(
      password,
      user.userAuth.password,
    );
    console.log('pass2');
    if (!isPasswordValid) {
      throw new WrongCredentialsProvidedException();
    }
    console.log('pass3');
    return user;
  }

  public refreshToken(user: UserEntity): string {
    return this._getCookieWithJwtToken(user.uuid);
  }

  public getCookiesForLogout(): string[] {
    return [
      'Authentication=; HttpOnly; Path=/; Max-Age=0',
      'Refresh=; HttpOnly; Path=/; Max-Age=0',
    ];
  }

  public async getUserIfRefreshTokenMatches(
    refreshToken: string,
    user: UserEntity,
  ): Promise<UserEntity> {
    const isRefreshTokenMatching = await validateHash(
      refreshToken,
      user.userAuth.currentHashedRefreshToken,
    );

    if (!isRefreshTokenMatching) {
      throw new RefreshTokenNotMatchingException();
    }

    return user;
  }

  public getJwtConfirmToken(email: string): string {
    const payload: VerificationTokenPayload = { email };
    const token = this._jwtService.sign(payload, {
      secret: this._configService.get('JWT_VERIFICATION_TOKEN_SECRET_KEY'),
      expiresIn: `${this._configService.get(
        'JWT_VERIFICATION_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    return token;
  }

  public async resendConfirmationLink(user: UserEntity): Promise<void> {
    if (user.userAuth.isEmailConfirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    // await this._mailService.sendConfirmationEmail(user);
  }

  public async confirm(user: UserEntity): Promise<void> {
    await this._userAuthService.markEmailAsConfirmed(user.userAuth.email);
  }

  private _getCookieWithJwtToken(uuid: string): string {
    const payload: TokenPayloadInterface = { uuid };
    const token = this._jwtService.sign(payload, {
      secret: this._configService.get('JWT_ACCESS_TOKEN_SECRET_KEY'),
      expiresIn: `${this._configService.get(
        'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
      )}s`,
    });

    return `Authentication=${token}; HttpOnly; Path=/; Max-Age=${this._configService.get(
      'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
    )}`;
  }

  private _getCookieWithJwtRefreshToken(uuid: string) {
    console.log('patataimportante', uuid);
    const payload: TokenPayloadInterface = { uuid };
    const token = this._jwtService.sign(payload, {
      secret: this._configService.get('JWT_REFRESH_TOKEN_SECRET_KEY'),
      expiresIn: `${this._configService.get(
        'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
      )}s`,
    });
    const cookie = `Refresh=${token}; HttpOnly; Path=/; Max-Age=${this._configService.get(
      'JWT_REFRESH_TOKEN_EXPIRATION_TIME',
    )}`;

    return { cookie, token };
  }
}
