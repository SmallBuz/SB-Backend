import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class userDeviceGetOneDto {

  @ApiProperty({ description: 'User Device name' })
  @IsString()
  @IsNotEmpty()
  readonly userDeviceName: string;



}