import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ForbiddenError } from 'apollo-server-fastify';
import { Connection, Equal, IsNull, Not, Repository } from 'typeorm';
import { Booking } from '../models/booking.entity';
import { Event } from '../models/event.entity';
import { ResourceOwner } from '../models/resource-owner.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private bookingsRepository: Repository<Booking>,
    @InjectRepository(Event) private eventsRepository: Repository<Event>,
    private connection: Connection,
  ) {}

  getBookedSchoolPlacesCountForEvent(eventId: string): Promise<number> {
    return this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.resourceOwner', 'ro')
      .where('booking.eventId = :eventId', { eventId })
      .andWhere('ro.sponsorResourceOwnerId IS NULL')
      .getCount();
  }

  getBookedExternPlacesCountForEvent(eventId: string): Promise<number> {
    return this.bookingsRepository
      .createQueryBuilder('booking')
      .leftJoin('booking.resourceOwner', 'ro')
      .where('booking.eventId = :eventId', { eventId })
      .andWhere('ro.sponsorResourceOwnerId IS NOT NULL')
      .getCount();
  }

  getUserBookings(user: ResourceOwner): Promise<Booking[]> {
    return this.bookingsRepository.find({
      where: {
        resourceOwner: {
          id: Equal(user.id),
        },
      },
    });
  }

  /**
   * Books the specified event for the given user.
   *
   * Steps:
   *  1. Check that some specifications exist for the user's BDE
   *  2. Check that the user is a member if the event is limited to members
   *  3. Check that the user did not already booked this event
   *  4. Check the number of places available for this type of user
   *    a. If not unlimited, check if the current count of bookings is lower than the max one
   *    b. Else just skip
   *  5. Book the event
   *
   * @param user The user wanting to book the event
   * @param eventId The ID of the event to book
   * @returns the booking
   */
  async bookEvent(user: ResourceOwner, eventId: string): Promise<Booking> {
    const event = await this.eventsRepository.findOne(eventId, {
      relations: ['specifications'],
    });
    const spec = event.specifications.find((spec) => spec.bdeId === user.bdeId);
    // 1.
    if (!spec) {
      throw new ForbiddenError(
        "Can't book this event because there's not places defined for your BDE",
      );
    }
    // 2.
    if (event.limitedToMembers && !user.isMember) {
      throw new ForbiddenError(
        "Can't book this event because it requires you to be a member.",
      );
    }

    const booking = await this.connection.transaction(async (manager) => {
      // 3.
      const searchedBooking = await manager.getRepository(Booking).findOne({
        where: {
          event: {
            id: Equal(event.id),
          },
          resourceOwner: {
            id: Equal(user.id),
          },
        },
      });
      if (searchedBooking) {
        throw new ForbiddenError('You already booked this event');
      }
      // 4.
      const countToCheck = user.isExtern
        ? spec.externPlacesCount
        : spec.schoolPlacesCount;
      if (countToCheck != null && countToCheck >= 0) {
        const bookedCount = await manager.getRepository(Booking).count({
          where: {
            event: {
              id: Equal(event.id),
            },
            resourceOwner: {
              sponsor: user.isExtern ? Not(IsNull()) : IsNull(),
              bdeId: Equal(user.bdeId),
            },
          },
        });

        if (bookedCount >= countToCheck) {
          throw new ForbiddenError(
            'There is no remaining places for this event',
          );
        }
      }
      // 5.
      const booking = await manager.getRepository(Booking).save({
        bookingDate: new Date(),
        event,
        resourceOwner: user,
      });

      return booking;
    });

    return booking;
  }
}
