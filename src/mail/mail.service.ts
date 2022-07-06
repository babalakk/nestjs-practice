/* eslint @typescript-eslint/no-var-requires: "off" */
import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
const formData = require('form-data');
const Mailgun = require('mailgun.js');
const mailgun = new Mailgun(formData);

@Injectable()
export class MailService {
  mg: any;

  constructor() {
    dotenv.config();
    const mg = mailgun.client({
      username: 'api',
      key: process.env.MAIL_GUN_API_KEY,
    });
    this.mg = mg;
  }

  async send(to: string, content: string) {
    this.mg.messages
      .create(process.env.MAIL_GUN_DOMAIN, {
        from: "noreply <noreply@my-sample-app.com'>",
        to: [to],
        subject: 'Email from aha-exam program',
        text: content,
      })
      .then((msg: any) => console.log(msg)) // logs response data
      .catch((err: any) => console.error(err)); // logs any error
  }
}
