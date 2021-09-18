import { UseGuards } from '@nestjs/common';
import { Resolver, Mutation, Args, Query } from '@nestjs/graphql';
import { BookingType } from '../graphql/types/booking.gql';
import { ResourceOwner } from '../models/resource-owner.entity';
import { User } from '../oauth/decorator/user.decorator';
import { AuthGuard } from '../oauth/guard/auth.guard';
import { BookingService } from './booking.service';

@Resolver()
export class BookingsResolver {
  constructor(private bookingsService: BookingService) {}

  @Query(() => [BookingType], {
    name: 'bookings',
    description: 'Returns all bookings of the requesting user',
  })
  @UseGuards(AuthGuard)
  async getBookings(@User() user: ResourceOwner): Promise<BookingType[]> {
    const bookings = await this.bookingsService.getUserBookings(user);
    return bookings.map((booking) => BookingType.fromBookingModel(booking));
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
}
