import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Booking } from '../../models/booking.entity';
import { Buffer } from 'buffer';
import { BadRequestException, NotFoundException } from '@nestjs/common';

@ObjectType('booking')
export class BookingType {
  @Field(() => ID)
  id: string;

  @Field()
  bookingDate: Date;

  static fromBookingModel(booking: Booking): BookingType {
    const gqlBooking = new BookingType();
    gqlBooking.id = this.composeId(booking.eventId, booking.resourceOwnerId);
    return gqlBooking;
  }

  static composeId(eventId: string, userId: string): string {
    return Buffer.from(`${eventId}:${userId}`, 'utf8').toString('base64');
  }

  static decomposeId(bookingId: string): [string, string] {
    try {
      const parts = Buffer.from(bookingId, 'base64')
        .toString('utf8')
        .split(':');
      if (parts.length != 2) throw new Error('Bad format');
      return [parts[0], parts[1]];
    } catch {
      throw new NotFoundException('Not booking with the given ID exist');
    }
  }
}
