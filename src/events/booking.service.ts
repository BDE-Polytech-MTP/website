import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, Not, Repository } from 'typeorm';
import { Booking } from '../models/booking.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking) private bookingsRepository: Repository<Booking>,
  ) {}

  getBookedSchoolPlacesCountForEvent(eventId: string): Promise<number> {
    return this.bookingsRepository.count({
      where: {
        event: {
          id: Equal(eventId),
        },
        resourceOwner: {
          sponsor: Equal(null),
        },
      },
    });
  }

  getBookedExternPlacesCountForEvent(eventId: string) {
    return this.bookingsRepository.count({
      where: {
        event: {
          id: Equal(eventId),
        },
        resourceOwner: {
          sponsor: Not(Equal(null)),
        },
      },
    });
  }
}
