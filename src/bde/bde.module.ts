import { Module } from '@nestjs/common';
import { BdeService } from './bde.service';
import { AccountModule } from '../account/account.module';
import { typeOrmModule } from '../models';
import { BdeResolver } from './bde.resolver';

@Module({
  imports: [typeOrmModule(), AccountModule],
  providers: [BdeService, BdeResolver],
})
export class BdeModule {}
