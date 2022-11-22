import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class userArchiveAddRequest {
  @ApiProperty({ description: 'User master email' })
  @IsString()
  @IsNotEmpty()
  readonly emailMaster: string;

  @ApiProperty({ description: 'Device uuid selected' })
  @IsString()
  @IsNotEmpty()
  readonly device_uuid: string;

  @ApiProperty({ description: 'Type of archive send' })
  @IsString()
  @IsNotEmpty()
  readonly data_type: string;

  @ApiProperty({ description: 'content´s payload' })
  @IsNotEmpty()
  readonly content: object[];

  @ApiProperty({ description: 'date' })
  @IsNotEmpty()
  readonly date: Date;
}
