import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class UserUpdateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @ApiProperty()
  readonly firstName?: string;

  @IsString()
  @ApiProperty()
  readonly middleName?: string;

  @IsString()
  @ApiProperty()
  readonly lastName?: string;

  @IsString()
  @ApiProperty()
  readonly motherName?: string;
}

