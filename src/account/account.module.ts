import { forwardRef, Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { typeOrmModule } from '../models';
import { PasswordModule } from '../password/password.module';
import { MailingModule } from '../mailing/mailing.module';
import { ConfigModule } from '@nestjs/config';
import { AccountResolver } from './account.resolver';
import { BdeModule } from '../bde/bde.module';
import { AccountController } from './account.controller';
import { OauthModule } from '../oauth/oauth.module';

@Module({
  providers: [AccountService, AccountResolver],
  imports: [
    typeOrmModule(),
    PasswordModule,
    MailingModule.forRoot(),
    ConfigModule,
    OauthModule,
    forwardRef(() => BdeModule),
  ],
  exports: [AccountService],
  controllers: [AccountController],
})
export class AccountModule {}
