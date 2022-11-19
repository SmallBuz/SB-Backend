import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class userDeviceUpdateRequest {

  @ApiProperty({ description: 'User Device name' })
  @IsString()
  @IsNotEmpty()
  deviceName: string;
  
  @ApiProperty({ description: 'Password of User´s Device' })
  @IsString()
  @IsNotEmpty()
  userPassword: string;

  @ApiProperty({ description: 'Device uuid selected to be erased' })
  @IsString()
  @IsNotEmpty()
  readonly device_uuid: string;
}
