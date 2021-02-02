import {
  Column,
  Entity,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Survey } from './survey.entity';
import { Booking } from './booking.entity';

@Entity()
export class SurveyChoice {
  @PrimaryGeneratedColumn('uuid')
  surveyChoiceID: string;

  @Column()
  title: string;

  @Column({ type: 'int' })
  limit: number;

  // Relationships

  @ManyToOne(() => Survey, (survey) => survey)
  survey: Survey;

  @ManyToMany(() => Booking, (booking) => booking.surveyChoices)
  bookings: Booking[];
}
