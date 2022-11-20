import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserUpdateDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly firstName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly middleName?: string;

  @IsString()
  @ApiProperty()
  readonly lastName?: string;

  @IsString()
  @IsOptional()
  @ApiProperty()
  readonly motherName?: string;
}

