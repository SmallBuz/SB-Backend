import 'providers/polyfill.provider';


import { ConfigService } from '@nestjs/config';
import { ConnectionOptions } from 'typeorm';
import { SnakeNamingStrategy } from '../modules/database/strategies';
import { UserAuthSubscriber, UserSubscriber } from '../modules/master_user/subscribers';



const configService = new ConfigService();

const config: ConnectionOptions = {
  type: 'postgres',
  host: configService.get('DB_HOST'),
  port: +configService.get<number>('DB_PORT'),
  username: configService.get('DB_USERNAME'),
  password: configService.get('DB_PASSWORD'),
  database: configService.get('DB_NAME'),
  namingStrategy: new SnakeNamingStrategy(),
  entities: ['src/modules/**/*{.entity,.index}{.ts,.js}'],
  migrations: ['src/migrations/*{.ts,.js}'],
  migrationsRun: true,
  subscribers: [UserSubscriber, UserAuthSubscriber],
  synchronize: false,
  logging: true,
};

export = config;
