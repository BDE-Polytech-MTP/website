import { Column, Entity, ManyToMany, ManyToOne } from 'typeorm';
import { ResourceOwner } from './resource-owner.entity';
import { Event } from './event.entity';
import { SurveyChoice } from './survey-choice.entity';

@Entity()
export class Booking {
  @Column()
  bookingDate: Date;

  @Column({ primary: true })
  resourceOwnerId: string;

  @Column({ primary: true })
  eventId: string;

  // Relationships

  @ManyToOne(() => ResourceOwner, (resourceOwner) => resourceOwner.bookings, {
    primary: true,
  })
  resourceOwner: ResourceOwner;

  @ManyToOne(() => Event, (event) => event.bookings, {
    primary: true,
  })
  event: Event;

  @ManyToMany(() => SurveyChoice, (surveyChoice) => surveyChoice.bookings)
  surveyChoices: SurveyChoice[];
}
