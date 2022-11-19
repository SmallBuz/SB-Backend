import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PageOptionsDto } from '../../../../common/dtos';
import { Repository } from 'typeorm';
import { userDeviceDto } from '../dto/models/user_device.dto';
import { userDeviceGetOneDto } from '../dto/request/user_device_get_one_request.dto';
import { userDeviceRemoveRequest } from '../dto/request/user_device_remove_request.dto';
import { userDeviceUpdateRequest } from '../dto/request/user_device_update_request.dto';
import { userDeviceEntity } from '../entities/pos_device.entity';

@Injectable()
export class UserDeviceService {
  constructor(
    @InjectRepository(userDeviceEntity)
    private readonly _userDeviceRepository: Repository<userDeviceEntity>,
  ) {}

  public async getAllDevices(
    userEmail: string,
    options: PageOptionsDto,
  ): Promise<any> {
    const [users, itemCount] = await this._userDeviceRepository
      .createQueryBuilder('user_device')
      .where('email_master = :email', { email: userEmail })
      //.orderBy('createdAt', options.order)
      .skip(options.skip)
      .take(options.take)
      .getManyAndCount();
    return {users, itemCount};
  }

  public async getOneDevice(
    emailMaster: string,
    oneDevice: userDeviceGetOneDto,
  ): Promise<any> {
    const queryBuilder = this._userDeviceRepository
      .createQueryBuilder('user_device')
      .where('email_master = :email', { email: emailMaster })
      .andWhere('uuid = :uuid', { uuid: oneDevice.userDeviceName })
      .getOne();
    return queryBuilder;
  }

  public async addOneDevice(
    emailMaster: string,
    userDevice: userDeviceDto,
  ): Promise<any> {
    const user = this._userDeviceRepository.create({
      userName: userDevice.userName,
      userPassword: userDevice.userPassword,
      emailMaster: emailMaster,
    });
    return await this._userDeviceRepository.save(user);
  }
  public async removeOneDevice(
    emailMaster: string,
    userDevice: userDeviceRemoveRequest,
  ): Promise<any> {
    const queryBuilder = this._userDeviceRepository
      .createQueryBuilder('user_devices')
      .update({
        emailMaster: emailMaster,
        uuid: userDevice.device_uuid,
      })
      .delete()
      .where('uuid = :uuid_device', { uuid_device: userDevice.device_uuid })
      .andWhere('email_master = :email_master', {
        email_master: emailMaster,
      })
      .execute();
    return queryBuilder;
  }
  public async updateOneDevice(userDevice: userDeviceUpdateRequest) {
    const queryBuilder = this._userDeviceRepository
      .createQueryBuilder('user_devices')
      .update(userDevice)
      .set({
        userName: userDevice.deviceName,
        userPassword: userDevice.userPassword,
      })
      .where('uuid = :uuid_device', { uuid_device: userDevice.device_uuid })
      .andWhere('email_master = :email_master', {
        email_master: userDevice.emailMaster,
      })
      .execute();
    return queryBuilder;
  }
}
