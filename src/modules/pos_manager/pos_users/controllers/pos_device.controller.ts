import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { POSDeviceService } from '../services/user_device.service';
import { ResponseCode } from '../../../../common/constants/response.constant';
import { userDeviceDto } from '../dto/models/user_device.dto';
import { userAddDeviceResponse } from '../dto/response/user_add_device_response.dto';
import { userAddDeviceGenericResponse } from '../dto/response/user_device_response.dto';
import { userDeviceRemoveRequest } from '../dto/request/user_device_remove_request.dto';
import { userDeviceUpdateRequest } from '../dto/request/user_device_update_request.dto';
import { JwtAccessTokenGuard } from '../../../auth/guards';
import { RequestWithUserInterface } from 'src/modules/auth/interfaces';
import { userDeviceGetOneDto } from '../dto/request/user_device_get_one_request.dto';
import { PageOptionsDto } from '../../../../common/dtos';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('userDevice')
@ApiTags('userDevice')
export class POSDeviceController {
  constructor(private readonly _userDevice: POSDeviceService) {}

  @Get('getAllUserDevices')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  
  @ApiResponse({
    status: 200,
    description: 'Retrieving array with user devices of master',
    type: [userAddDeviceGenericResponse],
  })
  @ApiOperation({ summary: 'Returns a list of all user Devices listed on DB' })
  async getUserDevices(
    @Req() req: RequestWithUserInterface,
    @Query() options: PageOptionsDto,
  ): Promise<any> {
    const userAddDeviceDtoResponse = new userAddDeviceResponse();
    return await this._userDevice
      .getAllDevices(req.user.userAuth.email, options)
      .then((e) => {
        userAddDeviceDtoResponse.Status = ResponseCode.SUCCESS_CODE;
        return e;
      })
      .catch((err) => {
        userAddDeviceDtoResponse.Status = ResponseCode.FAIL_CODE;
        return userAddDeviceDtoResponse;
      });
  }

  @Post('getOneDevice')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Retrieving array with user devices of master',
    type: [userAddDeviceGenericResponse],
  })
  @ApiOperation({ summary: 'Returns a list of all user Devices listed on DB' })
  async GetOneDevice(
    @Req() req: RequestWithUserInterface,
    @Body() userGetOneDeviceDto: userDeviceGetOneDto,
  ): Promise<any> {
    const userAddDeviceDtoResponse = new userAddDeviceResponse();
    return await this._userDevice
      .getOneDevice(req.user.userAuth.email, userGetOneDeviceDto)
      .then((e) => {
        userAddDeviceDtoResponse.Status = ResponseCode.SUCCESS_CODE;
        return e;
      })
      .catch((err) => {
        userAddDeviceDtoResponse.Status = ResponseCode.FAIL_CODE;
        return userAddDeviceDtoResponse;
      });
  }

  @Post('addOneDevice')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'adds one device to user master' })
  @ApiResponse({
    status: 200,
    description: 'Update successfully executed',
    type: [userAddDeviceResponse],
  })
  async addOneUserDevice(
    @Req() req: RequestWithUserInterface,
    @Body() userDeviceRequest: userDeviceDto,
  ): Promise<userAddDeviceResponse> {
    const userAddDeviceDtoResponse = new userAddDeviceResponse();
    return await this._userDevice
      .addOneDevice(req.user.userAuth.email, userDeviceRequest)
      .then(() => {
        userAddDeviceDtoResponse.Status = ResponseCode.SUCCESS_CODE;
        return userAddDeviceDtoResponse;
      })
      .catch((err) => {
        userAddDeviceDtoResponse.Status = ResponseCode.FAIL_CODE;
        return userAddDeviceDtoResponse;
      });
  }
  @Post('removeOneDevice')
  @UseGuards(JwtAccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'remove one device to user master' })
  @ApiResponse({
    status: 200,
    description: 'Update successfully executed',
    type: [userAddDeviceResponse],
  })
  async removeOneUserDevice(
    @Req() req: RequestWithUserInterface,
    @Body() userDeviceRequest: userDeviceRemoveRequest,
  ): Promise<userAddDeviceResponse> {
    const userAddDeviceDtoResponse = new userAddDeviceResponse();
    return await this._userDevice
      .removeOneDevice(req.user.userAuth.email, userDeviceRequest)
      .then(() => {
        userAddDeviceDtoResponse.Status = ResponseCode.SUCCESS_CODE;
        return userAddDeviceDtoResponse;
      })
      .catch((err) => {
        userAddDeviceDtoResponse.Status = ResponseCode.FAIL_CODE;
        return userAddDeviceDtoResponse;
      });
  }

  @Post('updateOneDevice')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'update one device to user master' })
  @ApiResponse({
    status: 200,
    description: 'Update successfully executed',
    type: [userAddDeviceResponse],
  })
  async updateOneUserDevice(
    @Body() userDeviceRequest: userDeviceUpdateRequest,
  ): Promise<userAddDeviceResponse> {
    const userAddDeviceDtoResponse = new userAddDeviceResponse();
    return await this._userDevice
      .updateOneDevice(userDeviceRequest)
      .then(() => {
        userAddDeviceDtoResponse.Status = ResponseCode.SUCCESS_CODE;
        return userAddDeviceDtoResponse;
      })
      .catch((err) => {
        userAddDeviceDtoResponse.Status = ResponseCode.FAIL_CODE;
        return userAddDeviceDtoResponse;
      });
  }
}
