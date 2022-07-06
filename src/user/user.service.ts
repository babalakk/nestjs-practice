/* eslint @typescript-eslint/no-var-requires: "off" */
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Raw } from 'typeorm';
import { UserEntity } from './user.entity';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { HttpStatus } from '@nestjs/common';
import * as argon2 from 'argon2';

const jwt = require('jsonwebtoken');

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
  ) {}

  async get_by_id(id: number) {
    return await this.usersRepository.findOneBy({ id: id });
  }

  async get_all_user() {
    const users = await this.usersRepository.find();
    const all_user = users.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        login_count: user.login_count,
        last_session: user.last_session,
      };
    });
    return all_user;
  }

  async update_name(user_id: number, new_name: string) {
    const user = await this.usersRepository.findOneBy({ id: user_id });
    if (user === null) {
      return null;
    }
    user.name = new_name;
    await this.usersRepository.save(user);
    return { email: user.email, name: user.name };
  }

  async create(
    name: string,
    email: string,
    password: string,
  ): Promise<UserEntity> {
    if (await this.exist_email(email)) {
      throw new HttpException(
        { message: 'Email already exists' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (this.validate_password(password)) {
      const newUser = new UserEntity();
      newUser.name = name;
      newUser.email = email;
      newUser.password = password;
      return await this.usersRepository.save(newUser);
    } else {
      throw new HttpException(
        { message: 'Password requirements not matched' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async login_by_email(email: string, password: string) {
    const user = await this.usersRepository.findOneBy({ email: email });
    if (user && (await argon2.verify(user.password, password))) {
      return user;
    }
    return null;
  }

  async get_profile(user_id: number) {
    const user = await this.usersRepository.findOneBy({ id: user_id });
    if (user === null) {
      return null;
    }
    return { email: user.email, name: user.name };
  }

  async reset_password(
    user_id: number,
    origin_password: string,
    new_password: string,
  ) {
    const user = await this.usersRepository.findOneBy({ id: user_id });
    if (
      user &&
      (user.password === null ||
        (await argon2.verify(user.password, origin_password)))
    ) {
      if (this.validate_password(new_password)) {
        user.password = new_password;
        return await this.usersRepository.save(user);
      } else {
        throw new HttpException(
          { message: 'Password requirements not matched' },
          HttpStatus.BAD_REQUEST,
        );
      }
    } else {
      throw new HttpException(
        { message: 'Invalid origin password' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async update_login_time(user: UserEntity) {
    user.login_count += 1;
    user.last_session = new Date();
    return await this.usersRepository.save(user);
  }

  async get_statistics() {
    return {
      total_signup: await this.usersRepository.count(),
      active_today: await this.usersRepository.countBy({
        last_session: Raw(
          (alias) => `date_trunc('day', ${alias}) = CURRENT_DATE`,
        ),
      }),
      active_seven_day: await this.usersRepository.countBy({
        last_session: Raw((alias) => `${alias} > (CURRENT_DATE - 7)`),
      }),
    };
  }

  async generate_jwt(user: UserEntity) {
    const today = new Date();
    const exp = new Date(today);
    exp.setDate(today.getDate() + 60);
    return jwt.sign(
      {
        id: user.id,
        name: user.name,
        verified: user.verified,
        exp: exp.getTime() / 1000,
      },
      process.env.JWT_SECRET,
    );
  }

  async activate(user: UserEntity) {
    user.verified = true;
    this.usersRepository.save(user);
  }

  async set_activate_code(user: UserEntity, code: string) {
    user.activate_code = code;
    this.usersRepository.save(user);
  }

  private validate_password(password: string) {
    const rules = [
      [
        /[a-z]/g.test(password),
        'password must contains at least one lower character',
      ],
      [
        /[A-Z]/g.test(password),
        'password must contains at least one upper character',
      ],
      [
        /\d/.test(password),
        'password must contains at least one digit character',
      ],
      [
        /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password),
        'password must contains at least one special character',
      ],
      [password.length >= 8, 'password must contains at least 8 characters'],
    ];
    for (const rule of rules) {
      if (rule[0] !== true) {
        throw new HttpException({ message: rule[1] }, HttpStatus.BAD_REQUEST);
      }
    }
    return true;
  }

  private async exist_email(email: string) {
    const user = await this.usersRepository.findOneBy({ email: email });
    if (user === null) {
      return false;
    }
    return true;
  }
}
