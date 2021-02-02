import { Module } from '@nestjs/common';
import { AccountService } from './account.service';
import { typeOrmModule } from '../models';

@Module({
  providers: [AccountService],
  imports: [typeOrmModule()]
})
export class AccountModule {}
