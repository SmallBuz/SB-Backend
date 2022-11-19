import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AuthModule } from '../auth';
import { DatabaseModule } from '../database';
import { MailModule } from '../mail';
import { UserModule } from '../master_user';
import { POSDeviceModule } from '../pos_manager/pos_users';
import { AppController } from './controllers';
import { AppService } from './services';
import { POSArchiveModule } from '../pos_manager/pos_archives/user_archives_module';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        APP_PORT: Joi.number(),
        APP_PREFIX: Joi.string(),
        APP_SITE_TITLE: Joi.string(),
        APP_SITE_URL: Joi.string(),
        APP_CONTACT_ADDRESS: Joi.string(),
        APP_CONTACT_CITY: Joi.string(),
        APP_CONTACT_STATE_ABBR: Joi.string(),
        APP_CONTACT_STATE: Joi.string(),
        APP_CONTACT_POSTAL_CODE: Joi.string(),
        APP_CONTACT_URL: Joi.string(),
        APP_UNSUBSCRIBE_URL: Joi.string(),
        APP_UNSUBSCRIBE_PREFERENCES_URL: Joi.string(),
        DB_HOST: Joi.string(),
        DB_PORT: Joi.number(),
        DB_USERNAME: Joi.string(),
        DB_PASSWORD: Joi.string().allow(''),
        DB_NAME: Joi.string(),
      }),
    }),
    DatabaseModule,
    UserModule,
    AuthModule,
    MailModule,
    POSDeviceModule,
    POSArchiveModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private dataSource: DataSource) {}
}
