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
import { UserRegistrationCleanDto, UserRegistrationDto } from '../../auth/dtos';
import {
  PinCodeGenerationErrorException,
  UserCreationException,
} from '../exceptions';
import { RoleType } from '../constants';
import { PostgresErrorCode } from '../../database/constraints';
import { InjectRepository } from '@nestjs/typeorm';
import { UserUpdateDto } from '../../auth/dtos/user-update.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    private DataSourceService: DataSource,
  ) {}

  public async createUser(
    userCreateDto: UserRegistrationDto,
  ): Promise<UserEntity> {
    let user: UserRegistrationCleanDto & UserEntity = undefined;
    console.log('userCreateDto', userCreateDto);
    try {
      if (userCreateDto.role == RoleType.POS_ACCOUNT) {
        console.log('POS');
        const role = userCreateDto.role;
        const email_master = userCreateDto.email_master;

        const userModel: UserRegistrationCleanDto = {
          firstName: userCreateDto.firstName,
          lastName: userCreateDto.lastName,
          email: userCreateDto.email,
          password: userCreateDto.password,
        };

        await this.DataSourceService.manager.transaction(
          async (transactionalEntityManager) => {
            user = await transactionalEntityManager.save(UserEntity, userModel);
            const pinCode = await this._createPinCode();
            const password = user.password;
            const createdUser = {
              ...userModel,
              role,
              password,
              user,
              pinCode,
              email_master,
            };
            await transactionalEntityManager.save(UserAuthEntity, createdUser);
          },
        );
      }
      if (userCreateDto.role == RoleType.MASTER_ACCOUNT) {
        console.log('master');
        const role = userCreateDto.role;
        const userModel: UserRegistrationCleanDto = {
          firstName: userCreateDto.firstName,
          lastName: userCreateDto.lastName,
          email: userCreateDto.email,
          password: userCreateDto.password,
        };

        await this.DataSourceService.manager.transaction(
          async (transactionalEntityManager) => {
            user = await transactionalEntityManager.save(UserEntity, userModel);

            const pinCode = await this._createPinCode();
            const password = user.password;
            const createdUser = {
              ...userModel,
              password,
              user,
              pinCode,
              role,
            };
            await transactionalEntityManager.save(UserAuthEntity, createdUser);
            console.log('interuser', user);
            return await this.findUser({ uuid: user.uuid });
          },
        );
      }
      return this.findUser({ uuid: user.uuid });
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
    const queryBuilder = await this._userRepository.createQueryBuilder('user');

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
    console.log;
    return await queryBuilder.getOne();
  }

  public async getUser(uuid: string): Promise<UserEntity | undefined> {
    const getUserResponse = await this.findUser({ uuid });
    return getUserResponse;
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
