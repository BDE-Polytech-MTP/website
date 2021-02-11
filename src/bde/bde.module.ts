import { Module } from '@nestjs/common';
import { BdeService } from './bde.service';
import { AccountModule } from '../account/account.module';
import { typeOrmModule } from '../models';

@Module({
  imports: [typeOrmModule(), AccountModule],
  providers: [BdeService],
})
export class BdeModule {}
