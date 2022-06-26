import { Injectable, NestMiddleware } from '@nestjs/common';
const jwt = require('jsonwebtoken');

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  async use(req: any, res: any, next: () => void) {
    console.log(req.originalUrl);
    const token = req.cookies['token'];
    if (typeof token === 'string') {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user_id = decoded.id;
      req.user_verified = decoded.verified;
    }
    next();
  }
}
