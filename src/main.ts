import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { join } from 'path';
import { auth } from 'express-openid-connect';
import * as cookieParser from 'cookie-parser';
import * as hbs from 'hbs';
import * as dotenv from 'dotenv';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  dotenv.config();
  
  // template engine
  app.setBaseViewsDir(join(__dirname, '..', 'templates'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', '/templates/common'));
  
  // swagger
  const doc_config = new DocumentBuilder()
  .setTitle('Aha exam')
  .setVersion('1.0')
  .build();
  const document = SwaggerModule.createDocument(app, doc_config);
  SwaggerModule.setup('api', app, document);
  
  // social login
  const port = process.env.PORT ? process.env.PORT : 3000;
  const domain = process.env.DOMAIN ? process.env.DOMAIN : 'localhost';
  const auth_config = {
    authRequired: false,
    auth0Logout: true,
    secret: process.env.AUTH0_SECRET,
    baseURL: 'http://'+ domain + ':' + port,
    clientID: process.env.AUTH0_CLIENT_ID,
    issuerBaseURL: process.env.AUTH0_ISSUER_URL,
  };
  app.use(auth(auth_config));

  app.use(cookieParser());

  await app.listen(port);
}
bootstrap();
