import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../../../modules/master_user';
import { UserEntity } from '../../../modules/master_user/entities';
import { POSDeviceController } from './controllers/pos_device.controller';

import { POSDeviceEntity } from './entities/pos_device.entity';
import { POSDeviceService } from './services/user_device.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([POSDeviceEntity, UserEntity]),
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET_KEY'),
        signOptions: {
          expiresIn: `${configService.get(
            'JWT_ACCESS_TOKEN_EXPIRATION_TIME',
          )}s`,
        },
      }),
    }),
    ConfigModule,
  ],
  controllers: [POSDeviceController],
  providers: [POSDeviceService],
  exports: [POSDeviceService],
})
export class POSDeviceModule {}
