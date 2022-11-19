import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { POSArchiveController } from './controllers/user_archive.controller';
import { POSArchiveEntity } from './entities/user_archive.entity';
import { POSArchiveService } from './services/user_archive.service';

@Module({
  imports: [TypeOrmModule.forFeature([POSArchiveEntity])],
  controllers: [POSArchiveController],
  providers: [POSArchiveService],
  exports: [POSArchiveService],
})
export class POSArchiveModule {}
