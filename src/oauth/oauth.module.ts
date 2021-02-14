import { Module } from '@nestjs/common';
import { OauthController } from './oauth.controller';
import { OAuthService } from './oauth.service';
import { ConfigModule } from '@nestjs/config';
import { PasswordModule } from '../password/password.module';
import { typeOrmModule } from '../models';
import { IdentifiedGuard } from './guard/identified.guard';
import { AuthGuard } from './guard/auth.guard';

@Module({
  imports: [typeOrmModule(), ConfigModule, PasswordModule],
  controllers: [OauthController],
  providers: [OAuthService, AuthGuard, IdentifiedGuard],
  exports: [OAuthService, AuthGuard, IdentifiedGuard],
})
export class OauthModule {}
