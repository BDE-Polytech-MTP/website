import { forwardRef, Module } from '@nestjs/common';
import { BdeService } from './bde.service';
import { AccountModule } from '../account/account.module';
import { typeOrmModule } from '../models';
import { BdeResolver } from './bde.resolver';

@Module({
  imports: [typeOrmModule(), forwardRef(() => AccountModule)],
  providers: [BdeService, BdeResolver],
  exports: [BdeService, BdeResolver],
})
export class BdeModule {}
