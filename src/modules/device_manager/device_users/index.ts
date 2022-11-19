import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { userDeviceController } from './controllers/device_manager.controller';
import { userDeviceEntity } from './entities/pos_device.entity';
import { UserDeviceService } from './services/user_device.service';



@Module({
  imports: [TypeOrmModule.forFeature([userDeviceEntity])],
  controllers: [userDeviceController],
  providers: [UserDeviceService],
  exports: [UserDeviceService],
})
export class userDeviceModule {}