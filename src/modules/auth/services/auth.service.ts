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
import { WrongPasswordProvidedException } from '../exceptions/wrong-password-provided.exception';
import { WrongMasterProvidedException } from '../exceptions/wrong-master-provided.exception';
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
    if (userRegistrationDto.role == RoleType.MASTER_ACCOUNT) {
      const user = await this._userService.createUser(userRegistrationDto);
      const data = await this._userService.getUserByMail(user.userAuth.email);
      const accessTokenCookie = await this._getCookieWithJwtToken(data.uuid);
      const { cookie: refreshTokenCookie, token: refreshToken } =
        this._getCookieWithJwtRefreshToken(data.uuid);

      await this._userAuthService.updateRefreshToken(
        data.userAuth.id,
        refreshToken,
      );

      return [accessTokenCookie, refreshTokenCookie];
    }
    if (userRegistrationDto.role == RoleType.POS_ACCOUNT) {
      const userMaster = await this._userService.getUser(
        userRegistrationDto.uuid_master,
      );
      userRegistrationDto.email_master = userMaster.userAuth.email;
      await this._userService.createUser(userRegistrationDto);

      const accessTokenCookie = await this._getCookieWithJwtToken(
        userMaster.uuid,
      );
      const { cookie: refreshTokenCookie, token: refreshToken } =
        this._getCookieWithJwtRefreshToken(userMaster.uuid);

      await this._userAuthService.updateRefreshToken(
        userMaster.userAuth.id,
        refreshToken,
      );

      return [accessTokenCookie, refreshTokenCookie];
    }
  }

  public async login(user: UserLoginDto): Promise<string[]> {
    if (!user.email_master && user.ac_type === RoleType.MASTER_ACCOUNT) {
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

    if (user.email_master && user.ac_type === RoleType.POS_ACCOUNT) {
      const userMaster = await this._userService.getUserByMail(
        user.email_master,
      );
      if (!userMaster) {
        throw new WrongMasterProvidedException();
      }
      const POSUserCheck = await this._posDeviceService.getOneDeviceLogin(
        userMaster,
        user,
      );
      if (POSUserCheck) {
        const userPOS = await this._userService.getUser(user.identifier);

        const accessTokenCookie = await this._getCookieWithJwtToken(
          userPOS.uuid,
        );

        const { cookie: refreshTokenCookie, token: refreshToken } =
          this._getCookieWithJwtRefreshToken(userPOS.uuid);

        await this._userAuthService.updateRefreshToken(
          userPOS.userAuth.id,
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
    console.log('pass1', user);
    if (!user) {
      throw new WrongCredentialsProvidedException();
    }
    console.log('pass', password);
    console.log('pass2', user.userAuth.password);
    const isPasswordValid = await validateHash(
      password,
      user.userAuth.password,
    );
    console.log('pass2', isPasswordValid);
    if (!isPasswordValid) {
      throw new WrongPasswordProvidedException();
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
