import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './user/user.entity';
import { AuthEntity } from './social/auth.entity';
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
    TypeOrmModule.forFeature([UserEntity]),
    UserModule,
    SocialModule,
    AuthModule,
    MailModule,
  ],
  controllers: [UserController, WebController],
  providers: [AppService, MailService],
})
export class AppModule {}

function get_db_options() {
  dotenv.config();
  let connectionOptions: ConnectionOptions;
  if (process.env.DATABASE_URL) {
    connectionOptions = {
      type: 'postgres',
      synchronize: false,
      logging: false,
      extra: {
        ssl: true,
      },
      entities: ['dist/entity/*.*'],
    };
    Object.assign(connectionOptions, { url: process.env.DATABASE_URL });
  } else {
    connectionOptions = {
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: process.env.MYSQL_USER_NAME,
      password: process.env.MYSQL_PASSWORD,
      database: 'test',
      entities: [UserEntity, AuthEntity],
      synchronize: true,
    };
  }
  return connectionOptions;
}
