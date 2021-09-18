import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Booking } from '../../models/booking.entity';
import { Buffer } from 'buffer';

@ObjectType('booking')
export class BookingType {
  @Field(() => ID)
  id: string;

  @Field()
  bookingDate: Date;

  static fromBookingModel(booking: Booking): BookingType {
    const gqlBooking = new BookingType();
    gqlBooking.id = Buffer.from(
      `${booking.eventId}:${booking.resourceOwnerId}`,
      'utf8',
    ).toString('base64');
    return gqlBooking;
  }
}
