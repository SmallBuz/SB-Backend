import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserMailSalesDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly name: string;


  @IsEmail()
  @IsNotEmpty()
  @ApiProperty()
  readonly email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  readonly message: string;
}
