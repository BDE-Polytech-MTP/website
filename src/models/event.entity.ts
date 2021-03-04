import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Booking } from './booking.entity';
import { Survey } from './survey.entity';
import { EventSpecification } from './event-specification.entity';

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

  // Relationships

  @OneToMany(() => Booking, (booking) => booking.event)
  bookings: Booking[];

  @OneToMany(() => Survey, (survey) => survey.event, { cascade: ['insert', 'remove'] })
  surveys: Survey[];

  @OneToMany(() => EventSpecification, (specification) => specification.event, { cascade: ['insert', 'remove'] })
  specifications: EventSpecification[];
}
