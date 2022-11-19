import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { POSDeviceController } from './controllers/pos_device.controller';

import { POSDeviceEntity } from './entities/pos_device.entity';
import { POSDeviceService } from './services/user_device.service';

@Module({
  imports: [TypeOrmModule.forFeature([POSDeviceEntity])],
  controllers: [POSDeviceController],
  providers: [POSDeviceService],
  exports: [POSDeviceService],
})
export class POSDeviceModule {}
