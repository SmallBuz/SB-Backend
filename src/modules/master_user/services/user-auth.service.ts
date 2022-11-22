import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { Repository, UpdateResult } from 'typeorm';

import { RoleType } from '../constants';
import { PostgresErrorCode } from '../../database/constraints';
import { UserAuthEntity, UserEntity } from '../entities';
import {
  PinCodeGenerationErrorException,
  UserCreationException,
} from '../exceptions';

import { UserService } from '.';
import { generateRandomInteger } from '../../../utils';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserAuthService {
  constructor(
    @InjectRepository(UserAuthEntity)
    private readonly _userAuthRepository: Repository<UserAuthEntity>,
    @Inject(forwardRef(() => UserService))
    private readonly _userService: UserService
  ) {}

  public async createUserAuth(createdUser): Promise<UserAuthEntity[]> {
    const pinCode = await this._createPinCode();
    const auth = this._userAuthRepository.create({ ...createdUser, pinCode });

    try {
      return this._userAuthRepository.save(auth);
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with that email already exists');
      }

      throw new UserCreationException(error);
    }
  }

  public async findUserAuth(
    options: Partial<{ pinCode: number; role: RoleType }>,
  ): Promise<UserEntity | undefined> {
    return this._userService.findUser(options);
  }

  public async markEmailAsConfirmed(email: string): Promise<UpdateResult> {
    return this._userAuthRepository.update(
      { email },
      { isEmailConfirmed: true },
    );
  }

  public async updateRefreshToken(
    userAuthId: number,
    currentHashedRefreshToken: string,
  ): Promise<UpdateResult> {
    return this._userAuthRepository.update(userAuthId, {
      currentHashedRefreshToken,
    });
  }

  private async _createPinCode(): Promise<number> {
    const pinCode = this._generatePinCode();
    const user = await this.findUserAuth({ pinCode });

    try {
      return user ? await this._createPinCode() : pinCode;
    } catch (error) {
      throw new PinCodeGenerationErrorException(error);
    }
  }

  private _generatePinCode(): number {
    return generateRandomInteger(1, 10e5 - 1);
  }
}
