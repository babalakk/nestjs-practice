import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from '../social/auth.entity';
import { UserEntity } from '../user/user.entity';
import { SocialMiddleware } from '../social/social.middleware';
import { UserModule } from '../user/user.module';

@Module({
  imports: [TypeOrmModule.forFeature([AuthEntity, UserEntity]), UserModule],
  providers: [],
  controllers: [],
})
export class SocialModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(SocialMiddleware).forRoutes('/');
  }
}
