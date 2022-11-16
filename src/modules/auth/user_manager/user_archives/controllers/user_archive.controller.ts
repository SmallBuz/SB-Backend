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
import { JwtAccessTokenGuard } from '../../../../../modules/auth/guards';
import { ResponseCode } from '../../../../../common/constants/response.constant';
import { userArchiveAddRequest } from '../dto/request/user_archive_add_request.dto';
import { userAddDeviceResponse } from '../dto/response/user_add_device_response.dto';
import { userAddDeviceGenericResponse } from '../dto/response/user_device_response.dto';
import { UserArchiveService } from '../services/user_archive.service';
import { PageOptionsDto } from '../../../../../common/dtos';
import { RequestWithUserInterface } from '../../../../../modules/auth/interfaces';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('userArchives')
@ApiTags('userArchives')
export class userArchiveController {
  constructor(private readonly _userArchive: UserArchiveService) {}

  @Get('GetAllUserArchives')
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
    @Query() options: PageOptionsDto
  ): Promise<any> {
    const userAddDeviceDtoResponse = new userAddDeviceResponse();

    return await this._userArchive
      .getAllArchives(req.user.userAuth.email,options)
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
