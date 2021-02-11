import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { typeOrmModule } from '../models';
import { PasswordModule } from '../password/password.module';
import { MailingModule } from '../mailing/mailing.module';

@Module({
  providers: [AccountService],
  imports: [typeOrmModule(), PasswordModule, MailingModule.forRoot()],
  exports: [AccountService],
})
export class AccountModule {}
