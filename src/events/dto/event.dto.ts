import { Field, GraphQLISODateTime, InputType, Int } from '@nestjs/graphql';
import { IsUUID, MaxLength, Min, MinLength } from 'class-validator';

@InputType('EventSpec')
export class CreateEventDto {
  @Field()
  @MinLength(1)
  @MaxLength(50)
  title: string;

  @Field({ defaultValue: '' })
  @MaxLength(2000)
  description: string;

  @Field(() => GraphQLISODateTime, { nullable: true })
  bookingStart: Date;

  @Field(() => GraphQLISODateTime, { nullable: true })
  bookingEnd: Date;

  @Field()
  limitedToMember: boolean;

  @Field(() => [EventPlacesDto])
  places: EventPlacesDto[];

  @Field(() => [EventSurveyDto])
  surveys: [EventSurveyDto];
}

@InputType('PlacesSpec')
export class EventPlacesDto {
  @Field()
  @IsUUID()
  bde: string;

  @Field(() => Int)
  @Min(-1)
  forSchool: number;

  @Field(() => Int)
  @Min(-1)
  forExterns: number;
}

@InputType('SurveySpec')
export class EventSurveyDto {
  @Field()
  @MinLength(1)
  @MaxLength(30)
  title: string;

  @Field()
  @MaxLength(2000)
  description: string;

  @Field()
  limitedToMembers: boolean;

  @Field()
  required: boolean;

  @Field()
  adminRestricted: boolean;

  @Field(() => [SurveyChoiceDto])
  choices: SurveyChoiceDto[];
}

@InputType('SurveyChoiceSpec')
export class SurveyChoiceDto {
  @Field()
  @MinLength(1)
  @MaxLength(20)
  name: string;

  @Field()
  @Min(-1)
  max: number;
}
