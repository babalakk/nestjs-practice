import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { MailService } from '../mail/mail.service';
import {
  CreateUserDto,
  LoginUserDto,
  ResetPasswordDto,
  UpdateUserNameDto,
} from './user.dto';
import * as dotenv from 'dotenv';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly service: UserService,
    private readonly mail_service: MailService,
  ) {}

  @Get('profile')
  async profile(@Req() req: any) {
    return await this.service.get_profile(req.user_id);
  }

  @Post('update_name')
  async update_name(@Req() req: any, @Body() dto: UpdateUserNameDto) {
    return await this.service.update_name(req.user_id, dto.new_name);
  }

  @Post('create')
  async create(@Body() dto: CreateUserDto) {
    if (dto.password != dto.confirm_password) {
      throw new HttpException(
        { message: 'password must be identical to confirm_password' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.service.create('user', dto.email, dto.password);
    const token = await this.service.generate_jwt(user);
    return token;
  }

  @Post('login')
  async login(@Body() dto: LoginUserDto) {
    const user = await this.service.login_by_email(dto.email, dto.password);
    if (!user) {
      throw new HttpException(
        { message: 'Email not exist or password incorrect' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const token = await this.service.generate_jwt(user);
    await this.service.update_login_time(user);
    return token;
  }

  @Post('reset_password')
  async reset_password(@Req() req: any, @Body() dto: ResetPasswordDto) {
    if (dto.new_password != dto.confirm_password) {
      throw new HttpException(
        { message: 'new password must be identical to confirm_password' },
        HttpStatus.BAD_REQUEST,
      );
    }
    const user = await this.service.reset_password(
      req.user_id,
      dto.origin_password,
      dto.new_password,
    );
    return user;
  }

  @Post('send_verify_email')
  async send_verify_email(@Req() req: any) {
    const code = this.generate_random_string();
    const user = await this.service.get_by_id(req.user_id);
    if (user === null) {
      throw new HttpException(
        { message: 'user not found' },
        HttpStatus.BAD_REQUEST,
      );
    }
    await this.service.set_activate_code(user, code);
    dotenv.config();
    const domain = process.env.DOMAIN;
    const activate_link = 'https://' + domain + '/user/activate?code=' + code;
    this.mail_service.send(
      user.email,
      'please visit this link to activate your accout: ' + activate_link,
    );
    return 'email has beed sent, it may take a few seconds';
  }

  @Get('activate')
  async activate(@Req() req: any, @Res({ passthrough: true }) res: any) {
    const code = req.query.code;
    const user = await this.service.get_by_id(req.user_id);
    if (user === null) {
      throw new HttpException(
        { message: 'user not found' },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (code === user.activate_code) {
      await this.service.activate(user);
      const jwt = await this.service.generate_jwt(user);
      await this.service.update_login_time(user);
      res.cookie('token', jwt);
      return 'activate successfully, return to <a href="/">dashboard</a>';
    } else {
      throw new HttpException(
        { message: 'Active code invalid' },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  @Get('statistics')
  async statistics() {
    return await this.service.get_statistics();
  }

  @Get('all_user')
  async all_user() {
    return await this.service.get_all_user();
  }

  private generate_random_string() {
    let text = '';
    const possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 5; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
}
