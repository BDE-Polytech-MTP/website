import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Event } from './event.entity';
import { SurveyChoice } from './survey-choice.entity';

@Entity()
export class Survey {
  @PrimaryGeneratedColumn('uuid')
  surveyID: string;

  @Column({
    type: 'bit',
    length: 2,
  })
  visibility: number;

  @Column()
  description: string;

  @Column()
  required: boolean;

  // Relationships

  @ManyToOne(() => Event, (event) => event.surveys)
  event: Event;

  @OneToMany(() => SurveyChoice, (choice) => choice.survey)
  choices: SurveyChoice;
}
