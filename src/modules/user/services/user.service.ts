import { BadRequestException, Injectable } from '@nestjs/common';
import { UserDto } from '../dtos';
import { UserAuthEntity, UserEntity } from '../entities';
import {
  generateRandomInteger,
  isEmail,
  isNumeric,
  isUUID,
} from '../../../utils';
import { PageDto, PageOptionsDto } from '../../../common/dtos';
import { DataSource, Repository } from 'typeorm';
import { UserRegistrationDto } from '../../../modules/auth/dtos';
import {
  PinCodeGenerationErrorException,
  UserCreationException,
} from '../exceptions';
import { RoleType } from '../constants';
import { PostgresErrorCode } from '../../../modules/database/constraints';
import { InjectRepository } from '@nestjs/typeorm';
import { UserUpdateDto } from '../../../modules/auth/dtos/user-update.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    private DataSourceService: DataSource,
  ) {}

  public async createUser(userCreateDto: UserRegistrationDto): Promise<any> {
    try {
      await this.DataSourceService.manager.transaction(
        async (transactionalEntityManager) => {
          const user = await transactionalEntityManager.save(
            UserEntity,
            userCreateDto,
          );
          const pinCode = await this._createPinCode();
          const password = user.password;
          const createdUser = { ...userCreateDto, password, user, pinCode };
          await transactionalEntityManager.save(UserAuthEntity, createdUser);
          return this.findUser({ uuid: user.uuid });
        },
      );
    } catch (error) {
      if (error?.code === PostgresErrorCode.UniqueViolation) {
        throw new BadRequestException('User with that email already exists');
      }

      throw new UserCreationException(error);
    }
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
  public async findUserAuth(
    options: Partial<{ pinCode: number; role: RoleType }>,
  ): Promise<UserEntity | undefined> {
    return this.findUser(options);
  }
  public async findUser(
    options: Partial<{ uuid: string; email: string; pinCode: number }>,
  ): Promise<UserEntity | undefined> {
    const queryBuilder = this._userRepository.createQueryBuilder('user');

    queryBuilder.leftJoinAndSelect('user.userAuth', 'userAuth');

    if (options.uuid && isUUID(options.uuid)) {
      queryBuilder.orWhere('user.uuid = :uuid', { uuid: options.uuid });
    }

    if (options.pinCode && isNumeric(options.pinCode)) {
      queryBuilder.orWhere('userAuth.pinCode = :pinCode', {
        pinCode: options.pinCode,
      });
    }

    if (options.email && isEmail(options.email)) {
      queryBuilder.orWhere('userAuth.email = :email', { email: options.email });
    }

    return queryBuilder.getOne();
  }

  public async getUser(uuid: string): Promise<UserEntity | undefined> {
    return this.findUser({ uuid });
  }
  public async getUserByMail(email: string): Promise<any> {
    const userData = await this.findUser({ email });
    return userData;
  }
  public async getUsers(options: PageOptionsDto): Promise<PageDto<UserDto>> {
    const queryBuilder = this._userRepository.createQueryBuilder('user');

    const [users, itemCount] = await queryBuilder
      .orderBy('user.createdAt', options.order)
      .skip(options.skip)
      .take(options.take)
      .getManyAndCount();

    return;
  }

  public async updateUser(userUpdate: UserUpdateDto): Promise<any> {
    const userData = await this.findUser({ email: userUpdate.email });

    userData.firstName = userUpdate.firstName;
    userData.middleName = userUpdate.middleName;
    userData.lastName = userUpdate.lastName;
    userData.motherName = userUpdate.motherName;
    this.DataSourceService.manager.save(userData);

    return;
  }
}
