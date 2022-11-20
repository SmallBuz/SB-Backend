import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageOptionsDto } from '../../../../common/dtos';
import { DataSource, Repository } from 'typeorm';
import { userDeviceDto } from '../dto/models/user_device.dto';
import { userDeviceGetOneDto } from '../dto/request/user_device_get_one_request.dto';
import { userDeviceRemoveRequest } from '../dto/request/user_device_remove_request.dto';
import { userDeviceUpdateRequest } from '../dto/request/user_device_update_request.dto';
import { userDeviceGetOneLoginDto } from '../dto/request/user_device_get_one_login_request.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserEntity } from '../../../../modules/master_user/entities';
import { isEmail } from 'class-validator';
import { UserService } from '../../../../modules/master_user/services';

@Injectable()
export class POSDeviceService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly _userRepository: Repository<UserEntity>,
    private readonly _jwtService: JwtService,
    private readonly _userService: UserService,
    private readonly _configService: ConfigService,
    private DataSourceService: DataSource,
  ) {}

  public async getAllDevices(
    userEmail: string,
    options: PageOptionsDto,
  ): Promise<any> {
    console.log('aquu');
    const [POSAccounts, itemCount] = await this._userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userAuth', 'userAuth')
      .where('email_master = :email', { email: userEmail })
      .skip(options.skip)
      .take(options.take)
      .getManyAndCount();
    let users = [];
    if (POSAccounts) {
      //console.log(POSAccounts)
      POSAccounts.forEach((user, index) => {
        users.push({
          firstName: user.firstName,
          uuid: user.uuid,
          email: user.userAuth.email,
          master: user.userAuth.email_master,
        });
      });
    }

  //  console.log('Todo', users);
    return { users, itemCount };
  }

  public async getOneDevice(
    emailMaster: string,
    oneDevice: userDeviceGetOneDto,
  ): Promise<any> {
    const queryBuilder = await this._userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userAuth', 'userAuth')
      .where('userAuth.email_master = :email_master', {
        email_master: emailMaster,
      })
      .andWhere('user.uuid = :email', {
        email: oneDevice.userDeviceName,
      })
      .getOne();
    let users = {};

    users['firstName'] = queryBuilder['firstName'];
    users['uuid'] = queryBuilder.uuid;
    users['email'] = queryBuilder.userAuth.email;
    users['password'] = queryBuilder.userAuth.password;

    return users;
  }
  public async getOneDeviceLogin(
    oneDevice: userDeviceGetOneLoginDto,
  ): Promise<any> {
    console.log('onedevice:', oneDevice);
    const queryBuilder = this._userRepository.createQueryBuilder('user');
    queryBuilder.leftJoinAndSelect('user.userAuth', 'userAuth');
    if (oneDevice.email_master && isEmail(oneDevice.email_master)) {
      await queryBuilder
        .where('userAuth.email_master = :email_master', {
          email_master: oneDevice.email_master,
        })
        .andWhere('userAuth.email = :email', {
          email: oneDevice.identifier,
        })
        .getOne();
      return queryBuilder;
    }
  }

  public async addOneDevice(
    emailMaster: string,
    userDevice: userDeviceDto,
  ): Promise<any> {
    // const user = this._posDeviceRepository.create({
    //   userName: userDevice.userName,
    //   userPassword: userDevice.userPassword,
    //   emailMaster: emailMaster,
    // });
    // return await this._posDeviceRepository.save(user);
  }
  public async removeOneDevice(
    emailMaster: string,
    userDevice: userDeviceRemoveRequest,
  ): Promise<any> {
    // const queryBuilder = this._posDeviceRepository
    //   .createQueryBuilder('user_devices')
    //   .update({
    //     emailMaster: emailMaster,
    //     uuid: userDevice.device_uuid,
    //   })
    //   .delete()
    //   .where('uuid = :uuid_device', { uuid_device: userDevice.device_uuid })
    //   .andWhere('email_master = :email_master', {
    //     email_master: emailMaster,
    //   })
    //   .execute();
    // return queryBuilder;
  }
  public async updateOneDevice(
    emailMaster: string,
    userDevice: userDeviceUpdateRequest,
  ) {
    const userData = await this._userService.findUser({
      uuid: userDevice.device_uuid,
    });
    if (userData.userAuth.email_master === emailMaster) {
      userData.firstName = userDevice.deviceName;
      userData.userAuth.password = userDevice.userPassword;
      await this.DataSourceService.manager.save(userData);
    }

    return;

    // const queryBuilder = this._posDeviceRepository
    //   .createQueryBuilder('user_devices')
    //   .update(userDevice)
    //   .set({
    //     userName: userDevice.deviceName,
    //     userPassword: userDevice.userPassword,
    //   })
    //   .where('uuid = :uuid_device', { uuid_device: userDevice.device_uuid })
    //   .andWhere('email_master = :email_master', {
    //     email_master: emailMaster,
    //   })
    //   .execute();
    // return queryBuilder;
  }
}
