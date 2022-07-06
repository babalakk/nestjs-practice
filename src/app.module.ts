import { Module } from '@nestjs/common';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UserController } from './user/user.controller';
import { WebController } from './web/web.controller';
import { SocialModule } from './social/social.module';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { ConnectionOptions } from 'typeorm';
import * as dotenv from 'dotenv';

@Module({
  imports: [
    TypeOrmModule.forRoot(get_db_options()),
    UserModule,
    SocialModule,
    AuthModule,
    MailModule,
  ],
  controllers: [UserController, WebController],
  providers: [MailService],
})
export class AppModule {}

function get_db_options() {
  dotenv.config();
  let connectionOptions: ConnectionOptions;
  if (process.env.DATABASE_URL) {
    connectionOptions = {
      type: 'postgres',
      synchronize: true,
      logging: false,
      ssl: true,
      extra: {
        ssl: {
          rejectUnauthorized: false,
        },
      },
      entities: ['**/*.entity.js'],
    };
    Object.assign(connectionOptions, { url: process.env.DATABASE_URL });
  } else {
    throw new Error('env DATABASE_URL must be specified');
  }
  return connectionOptions;
}
