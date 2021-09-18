import { Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsAdminResolver } from './events.admin.resolver';
import { EventsUserResolver } from './events.user.resolver';
import { typeOrmModule } from 'src/models';
import { OauthModule } from 'src/oauth/oauth.module';
import { BookingService } from './booking.service';
import { BookingsResolver } from './bookings.user.resolver';

@Module({
  imports: [typeOrmModule(), OauthModule],
  providers: [
    EventsService,
    EventsAdminResolver,
    EventsUserResolver,
    BookingService,
    BookingsResolver,
  ],
})
export class EventsModule {}
