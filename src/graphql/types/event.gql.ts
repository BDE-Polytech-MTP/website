import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Event } from '../../models/event.entity';

@ObjectType('userEvent')
export class UserEventType {
  @Field(() => ID)
  id: string;

  @Field({ description: 'The title of the event' })
  title: string;

  @Field({ description: 'A description of the event' })
  description: string;

  @Field({
    description:
      'The date the users can start booking event from if defined. Otherwise, users can book event ',
    nullable: true,
  })
  bookingStart: Date;

  @Field({
    description:
      'The date from which the user cannot book event anymore (if defined). If not defined, users can book event forever.',
    nullable: true,
  })
  bookingEnd: Date;

  @Field(() => Int, {
    description: 'The total number of places available for school students',
    nullable: true,
  })
  totalSchoolPlacesCount: number;

  @Field(() => Int, {
    description: 'The total number of places available for externs',
    nullable: true,
  })
  totalExternPlacesCount: number;

  @Field({
    description:
      'Indicates if only students that are members (subscribed to BDE) can book',
  })
  isMemberOnly: boolean;

  static fromEventModel(event: Event): UserEventType {
    const mappedType: UserEventType = new UserEventType();

    mappedType.id = event.id;
    mappedType.title = event.title;
    mappedType.description = event.description;
    mappedType.bookingStart = event.bookingStart;
    mappedType.bookingEnd = event.bookingEnd;
    mappedType.isMemberOnly = event.limitedToMembers;

    const spec = event.specifications[0];

    mappedType.totalSchoolPlacesCount = spec.schoolPlacesCount;
    mappedType.totalExternPlacesCount = spec.externPlacesCount;

    return mappedType;
  }
}
