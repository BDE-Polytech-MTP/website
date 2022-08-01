import { UseGuards } from '@nestjs/common';
import {
  Resolver,
  Mutation,
  Args,
  Query,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { BookingType } from '../graphql/types/booking.gql';
import { UserEventType } from '../graphql/types/event.gql';
import { ResourceOwner } from '../models/resource-owner.entity';
import { User } from '../oauth/decorator/user.decorator';
import { AuthGuard } from '../oauth/guard/auth.guard';
import { BookingService } from './booking.service';
import { EventsService } from './events.service';

@Resolver(() => BookingType)
export class BookingsResolver {
  constructor(
    private bookingsService: BookingService,
    private eventsService: EventsService,
  ) {}

  @Query(() => [BookingType], {
    name: 'bookings',
    description: 'Returns all bookings of the requesting user',
  })
  @UseGuards(AuthGuard)
  async getBookings(@User() user: ResourceOwner): Promise<BookingType[]> {
    const bookings = await this.bookingsService.getUserBookings(user);
    return bookings.map((booking) => BookingType.fromBookingModel(booking));
  }

  @Query(() => BookingType, {
    name: 'booking',
    description: 'Returns a booking',
  })
  @UseGuards(AuthGuard)
  async getBooking(
    @User() user: ResourceOwner,
    @Args('bookingId') bookingId: string,
  ) {
    const [eventId, userId] = BookingType.decomposeId(bookingId);
    const booking = await this.bookingsService.getBooking(
      eventId,
      userId,
      user,
    );
    return BookingType.fromBookingModel(booking);
  }

  @Mutation(() => BookingType, { name: 'book' })
  @UseGuards(AuthGuard)
  async bookEvent(
    @User() user: ResourceOwner,
    @Args('eventId') eventId: string,
  ): Promise<BookingType> {
    const booking = await this.bookingsService.bookEvent(user, eventId);
    return BookingType.fromBookingModel(booking);
  }

  @ResolveField('event', () => UserEventType)
  @UseGuards(AuthGuard)
  async event(
    @Parent() booking: BookingType,
    @User() user: ResourceOwner,
  ): Promise<UserEventType> {
    const [eventId] = Buffer.from(booking.id, 'base64')
      .toString('utf8')
      .split(':');
    const event = await this.eventsService.getEventById(eventId, user);
    return UserEventType.fromEventModel(event);
  }
}
