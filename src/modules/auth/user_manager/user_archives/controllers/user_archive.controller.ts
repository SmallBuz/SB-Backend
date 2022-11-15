import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAccessTokenGuard } from '../../../../../modules/auth/guards';
import { ResponseCode } from '../../../../../common/constants/response.constant';
import { userArchiveAddRequest } from '../dto/request/user_archive_add_request.dto';
import { userArchiveGetRequest } from '../dto/request/user_archive_get_request.dto';
import { userAddDeviceResponse } from '../dto/response/user_add_device_response.dto';
import { userAddDeviceGenericResponse } from '../dto/response/user_device_response.dto';
import { UserArchiveService } from '../services/user_archive.service';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('userArchives')
@ApiTags('userArchives')
export class userArchiveController {
  constructor(private readonly _userArchive: UserArchiveService) {}

  @Post('GetAllUserArchives')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Retrieving array with user devices of master',
    type: [userAddDeviceGenericResponse],
  })
  @ApiOperation({ summary: 'Returns a list of all user Devices listed on DB' })
  async getUserDevices(
    @Body() userGetRequest: userArchiveGetRequest,
  ): Promise<any> {
    const userAddDeviceDtoResponse = new userAddDeviceResponse();

    return await this._userArchive
      .getAllArchives(userGetRequest)
      .then((e) => {
        userAddDeviceDtoResponse.Status = ResponseCode.SUCCESS_CODE;
        return e;
      })
      .catch((err) => {
        console.log(err)
        userAddDeviceDtoResponse.Status = ResponseCode.FAIL_CODE;
        return userAddDeviceDtoResponse;
      });
  }

  @Post('addUserArchive')
  @HttpCode(HttpStatus.OK)
  @ApiResponse({
    status: 200,
    description: 'Retrieving array with user devices of master',
    type: [userAddDeviceGenericResponse],
  })
  @ApiOperation({ summary: 'Returns a list of all user Devices listed on DB' })
  async addUserArchive(
    @Body() userAddRequest: userArchiveAddRequest,
  ): Promise<any> {
    const userAddDeviceDtoResponse = new userAddDeviceResponse();
    return await this._userArchive
      .addOneArchive(userAddRequest)
      .then((e) => {
        userAddDeviceDtoResponse.Status = ResponseCode.SUCCESS_CODE;
        return e;
      })
      .catch((err) => {
        userAddDeviceDtoResponse.Status = ResponseCode.FAIL_CODE;
        return userAddDeviceDtoResponse;
      });
  }
}
