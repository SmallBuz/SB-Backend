import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { userArchiveController } from './controllers/user_archive.controller';
import { userArchiveEntity } from './entities/user_archive.entity';
import { UserArchiveService } from './services/user_archive.service';



@Module({
  imports: [TypeOrmModule.forFeature([userArchiveEntity])],
  controllers: [userArchiveController],
  providers: [UserArchiveService],
  exports: [UserArchiveService],
})
export class userArchiveModule {}