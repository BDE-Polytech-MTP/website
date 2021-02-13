import { forwardRef, Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { typeOrmModule } from '../models';
import { PasswordModule } from '../password/password.module';
import { MailingModule } from '../mailing/mailing.module';
import { ConfigModule } from '@nestjs/config';
import { AccountResolver } from './account.resolver';
import { BdeModule } from '../bde/bde.module';

@Module({
  providers: [AccountService, AccountResolver],
  imports: [
    typeOrmModule(),
    PasswordModule,
    MailingModule.forRoot(),
    ConfigModule,
    forwardRef(() => BdeModule),
  ],
  exports: [AccountService],
})
export class AccountModule {}
