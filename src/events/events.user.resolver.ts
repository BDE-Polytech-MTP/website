import { UseGuards } from '@nestjs/common';
import { Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserEventType } from '../graphql/types/event.gql';
import { ResourceOwner } from '../models/resource-owner.entity';
import { User } from '../oauth/decorator/user.decorator';
import { AuthGuard } from '../oauth/guard/auth.guard';
import { BookingService } from './booking.service';
import { EventsService } from './events.service';

@Resolver(() => UserEventType)
export class EventsUserResolver {
  constructor(
    private eventsService: EventsService,
    private bookingsService: BookingService,
  ) {}

  @Query(() => [UserEventType], {
    name: 'bookableEvents',
    description:
      'Returns an array of events that could be booked by the user triggering the query. If an event is full, it will still be returned if the user was able to book before the event was full.',
  })
  @UseGuards(AuthGuard)
  async getBoobableEvents(
    @User() user: ResourceOwner,
  ): Promise<UserEventType[]> {
    const availableEventsForUser = await this.eventsService.getEventsAvailablesForUser(
      user,
    );
    return availableEventsForUser.map((event) =>
      UserEventType.fromEventModel(event),
    );
  }

  @ResolveField('bookedSchoolPlacesCount', () => Int, {
    description:
      'The number of places for school students that are already booked',
  })
  getBookedSchoolPlacesCount(@Parent() event: UserEventType): Promise<number> {
    return this.bookingsService.getBookedSchoolPlacesCountForEvent(event.id);
  }

  @ResolveField('bookedExternPlacesCount', () => Int, {
    description: 'The number of places for externs that are already booked',
  })
  getBookedExternPlacesCount(@Parent() event: UserEventType): Promise<number> {
    return this.bookingsService.getBookedExternPlacesCountForEvent(event.id);
  }
}
