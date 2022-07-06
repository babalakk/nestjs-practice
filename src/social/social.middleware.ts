import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { AuthEntity } from './auth.entity';

@Injectable()
export class SocialMiddleware implements NestMiddleware {
  constructor(
    private userService: UserService,
    @InjectRepository(AuthEntity)
    private authRepository: Repository<AuthEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async use(req: any, res: any, next: () => void) {
    const token = req.cookies['token'];
    if (typeof token === 'string') {
      next();
    } else {
      const social_user = req.oidc.user;
      if (social_user) {
        const [social_provider, social_id] = social_user.sub.split('|');
        let auth = await this.authRepository.findOne({
          where: { social_provider: social_provider, social_id: social_id },
          relations: ['user'],
        });

        if (auth === null) {
          let user = await this.userRepository.findOneBy({
            email: social_user.email,
          });
          if (user === null) {
            user = new UserEntity();
            user.name = social_user.nickname;
            user.email = social_user.email;
            user.verified = true;
            await this.userRepository.save(user);
          }

          auth = new AuthEntity();
          auth.email = social_user.email;
          auth.nickname = social_user.nickname;
          auth.picture = social_user.picture;
          auth.social_provider = social_provider;
          auth.social_id = social_id;
          auth.user = user;
          await this.authRepository.save(auth);
        }
        const jwt = await this.userService.generate_jwt(auth.user);
        await this.userService.update_login_time(auth.user);
        res.cookie('token', jwt);
        req.user_id = auth.user.id;
      }
      next();
    }
  }
}
