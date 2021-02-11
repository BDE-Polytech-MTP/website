import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { ConfigModule } from '@nestjs/config';
import { PasswordModule } from '../password/password.module';
import { typeOrmModule } from '../models';
import { OAuthMiddleware } from './middleware/oauth.middleware';

@Module({
  imports: [typeOrmModule(), ConfigModule, PasswordModule],
  controllers: [OauthController],
  providers: [OAuthService, OAuthMiddleware],
  exports: [OAuthService, OAuthMiddleware]
})
export class OauthModule {}
