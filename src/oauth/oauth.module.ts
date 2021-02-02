import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { ConfigModule } from '@nestjs/config';
import { PasswordModule } from '../password/password.module';
import { typeOrmModule } from '../models';

@Module({
  imports: [typeOrmModule(), ConfigModule, PasswordModule],
  controllers: [OauthController],
  providers: [OAuthService],
})
export class OauthModule {}
