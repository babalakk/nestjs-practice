import { SocialMiddleware } from './social.middleware';

describe('SocialMiddleware', () => {
  it('should be defined', () => {
    expect(new SocialMiddleware()).toBeDefined();
  });
});
