import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserController } from './controllers';
import { UserAuthRepository, UserRepository } from './repositories';
import { UserService, UserAuthService } from './services';


@Module({
  imports: [TypeOrmModule.forFeature([UserRepository, UserAuthRepository])],
  controllers: [UserController],
  providers: [UserService, UserAuthService],
  exports: [UserService, UserAuthService],
})
export class UserModule {}
