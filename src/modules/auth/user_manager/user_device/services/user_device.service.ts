import { Injectable } from '@nestjs/common';
import { userDeviceDto } from '../dto/models/user_device.dto';
import { userDeviceGetRequest } from '../dto/request/user_device_get_request.dto';
import { userDeviceRemoveRequest } from '../dto/request/user_device_remove_request.dto';
import { userDeviceUpdateRequest } from '../dto/request/user_device_update_request.dto';
import { userDeviceRepository } from '../repositories/user_device.repository';

@Injectable()
export class UserDeviceService {
  constructor(private readonly _userDeviceRepository: userDeviceRepository) {}

  public async getAllDevices(
    userGetDevice: userDeviceGetRequest,
  ): Promise<any> {
    const queryBuilder = this._userDeviceRepository
      .createQueryBuilder('user_devices')
      .where('email_master = :email', { email: userGetDevice.userEmail })
      .execute();
    return queryBuilder;
  }
  public async addOneDevice(userDevice: userDeviceDto): Promise<any> {
    const user = this._userDeviceRepository.create(userDevice);
    return await this._userDeviceRepository.save(user);
  }
  public async removeOneDevice(
    userDevice: userDeviceRemoveRequest,
  ): Promise<any> {
    const queryBuilder = this._userDeviceRepository
      .createQueryBuilder('user_devices')
      .update(userDevice)
      .delete()
      .where('uuid = :uuid_device', { uuid_device: userDevice.device_uuid })
      .andWhere('email_master = :email_master', {
        email_master: userDevice.emailMaster,
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
