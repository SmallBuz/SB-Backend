import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserLoginDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly identifier: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly password: string;
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly ac_type: string;

  @ApiProperty({ description: 'User Device name' })
  @IsEmail()
  @IsOptional()
  readonly email_master: string;
}
