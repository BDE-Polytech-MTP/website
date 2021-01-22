import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthClient } from '../models/oauth-client.entity';
import { OAuthAuthorizationCode } from '../models/oauth-authorization-code.entity';
import { ResourceOwner } from '../models/resource-owner.entity';
import { OAuthToken } from '../models/oauth-token.entity';
import { ConfigModule } from '@nestjs/config';
import { PasswordModule } from '../password/password.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OAuthClient,
      OAuthAuthorizationCode,
      OAuthToken,
      ResourceOwner,
    ]),
    ConfigModule,
    PasswordModule
  ],
  controllers: [OauthController],
  providers: [OAuthService],
})
export class OauthModule {}
