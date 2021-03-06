import { Injectable, NestMiddleware } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { Repository } from 'typeorm';
import { SocialEntity } from './socail.entity';

@Injectable()
export class SocialMiddleware implements NestMiddleware {
  constructor(
    private userService: UserService,
    @InjectRepository(SocialEntity)
    private socialRepository: Repository<SocialEntity>,
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
        let social = await this.socialRepository.findOne({
          where: { social_provider: social_provider, social_id: social_id },
          relations: ['user'],
        });

        if (social === null) {
          let user = null;
          if (social_user.email) {
            user = await this.userRepository.findOneBy({
              email: social_user.email,
            });
            if (user === null) {
              user = new UserEntity();
              user.name = social_user.nickname;
              user.email = social_user.email;
              user.verified = true;
              await this.userRepository.save(user);
            }
          } else {
            user = new UserEntity();
            user.name = social_user.nickname;
            user.verified = true;
            await this.userRepository.save(user);
          }

          social = new SocialEntity();
          social.email = social_user.email;
          social.nickname = social_user.nickname;
          social.picture = social_user.picture;
          social.social_provider = social_provider;
          social.social_id = social_id;
          social.user = user;
          await this.socialRepository.save(social);
        }
        const jwt = await this.userService.generate_jwt(social.user);
        await this.userService.update_login_time(social.user);
        res.cookie('token', jwt);
        req.user_id = social.user.id;
      }
      next();
    }
  }
}
