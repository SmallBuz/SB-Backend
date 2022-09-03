import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class userDeviceRemoveRequest {

  @ApiProperty({ description: 'User Device name' })
  @IsString()
  @IsNotEmpty()
   emailMaster: string;

  @ApiProperty({ description: 'Device uuid selected to be erased' })
  @IsString()
  @IsNotEmpty()
  readonly device_uuid: string;

}