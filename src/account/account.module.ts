import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { typeOrmModule } from '../models';
import { PasswordModule } from '../password/password.module';

@Module({
  providers: [AccountService],
  imports: [typeOrmModule(), PasswordModule],
  exports: [AccountService],
})
export class AccountModule {}
