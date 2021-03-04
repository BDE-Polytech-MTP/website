import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType('event')
export class EventType {
  @Field(() => ID)
  id: string;
}
