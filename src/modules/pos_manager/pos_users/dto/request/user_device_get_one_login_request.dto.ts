import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class userDeviceGetOneLoginDto {
  @ApiProperty({ description: 'User Device name' })
  @IsString()
  @IsNotEmpty()
  readonly identifier: string;

  @ApiProperty({ description: 'User Device name' })
  @IsString()
  @IsNotEmpty()
  readonly password: string;

  @ApiProperty({ description: 'User Device name' })
  @IsEmail()
  @IsNotEmpty()
  readonly email_master: string;
}
