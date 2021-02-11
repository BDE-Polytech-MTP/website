import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SpecialtyType } from './specialty.gql';

@ObjectType('bde')
export class BdeType {
  @Field(() => ID)
  id: string;

  @Field()
  name: string;

  @Field(() => [SpecialtyType], {
    description: 'The specialties provided by this BDE',
  })
  specialties: SpecialtyType[];
}
