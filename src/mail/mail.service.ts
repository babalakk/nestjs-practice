import { Injectable } from '@nestjs/common';
import { NodeMailgun } from 'ts-mailgun';
import * as dotenv from 'dotenv';

@Injectable()
export class MailService {
  mailer: NodeMailgun;

  constructor() {
    dotenv.config();
    const mailer = new NodeMailgun();
    mailer.apiKey = process.env.MAIL_GUN_API_KEY;
    mailer.domain = process.env.MAIL_GUN_DOMAIN;
    mailer.fromEmail = 'noreply@my-sample-app.com';
    mailer.fromTitle = 'My Sample App';
    mailer.init();
    this.mailer = mailer;
  }

  async send(to: string, content: string) {
    this.mailer
      .send(to, 'Hello!', content)
      .then((result) => console.log('Done', result))
      .catch((error) => console.error('Error: ', error));
  }
}
