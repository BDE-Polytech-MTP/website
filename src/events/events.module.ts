import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsResolver } from './events.resolver';
import { typeOrmModule } from 'src/models';
import { OauthModule } from 'src/oauth/oauth.module';

@Module({
  imports: [typeOrmModule(), OauthModule],
  providers: [EventsService, EventsResolver],
})
export class EventsModule {}
