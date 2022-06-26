import { Controller, Get, Render, Req, Res } from '@nestjs/common';
@Controller('')
export class WebController {
  @Get('sign_up')
  @Render('sign_up')
  sign_up() {
    return;
  }

  @Get('sign_in')
  @Render('sign_in')
  sign_in() {
    return;
  }

  @Get('app_logout')
  app_logout(@Res() res: any) {
    res.clearCookie('token');
    return res.redirect('/logout');
  }

  @Get()
  index(@Req() req: any, @Res() res: any) {
    if (req.user_id) {
      return res.redirect('/dashboard');
    } else {
      return res.render('index');
    }
  }

  @Get('profile')
  async profile(@Req() req: any, @Res() res: any) {
    if (req.user_id) {
      return res.render('profile');
    } else {
      return res.redirect('/sign_in');
    }
  }

  @Get('dashboard')
  async dashboard(@Req() req: any, @Res() res: any) {
    if (req.user_id) {
      if (req.user_verified) {
        return res.render('dashboard');
      } else {
        return res.render('verify');
      }
    } else {
      return res.redirect('/sign_in');
    }
  }
}
