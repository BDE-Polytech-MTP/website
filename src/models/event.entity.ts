import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Booking } from './booking.entity';
import { Survey } from './survey.entity';
import { EventSpecification } from './event-specification.entity';
import { BDE } from './bde.entity';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  limitedToMembers: boolean;

  @Column({ nullable: true })
  bookingStart: Date;

  @Column({ nullable: true })
  bookingEnd: Date;

  @Column()
  organizerId: string;

  // Relationships

  @ManyToOne(() => BDE)
  organizer: BDE;

  @OneToMany(() => Booking, (booking) => booking.event)
  bookings: Booking[];

  @OneToMany(() => Survey, (survey) => survey.event, {
    cascade: ['insert', 'remove'],
  })
  surveys: Survey[];

  @OneToMany(() => EventSpecification, (specification) => specification.event, {
    cascade: ['insert', 'remove'],
  })
  specifications: EventSpecification[];
}
