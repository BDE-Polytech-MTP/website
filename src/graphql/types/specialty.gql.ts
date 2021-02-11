import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('specialty')
export class SpecialtyType {
  @Field({ description: 'The acronym used to name the specialty' })
  shortName: string;

  @Field({ description: 'The long name of the specialty' })
  longName: string;

  @Field(() => Int)
  year: number;
}
