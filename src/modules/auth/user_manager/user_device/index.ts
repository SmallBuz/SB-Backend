import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { userDeviceController } from './controllers/user_device.controller';
import { userDeviceEntity } from './entities/user_device.entity';
import { UserDeviceService } from './services/user_device.service';



@Module({
  imports: [TypeOrmModule.forFeature([userDeviceEntity])],
  controllers: [userDeviceController],
  providers: [UserDeviceService],
  exports: [UserDeviceService],
})
export class userDeviceModule {}