import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SpecialtyType } from './specialty.gql';
import { BDE } from '../../models/bde.entity';

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

  static fromBdeModel(bde: BDE) {
    const ret = new BdeType();
    ret.name = bde.name;
    ret.id = bde.id;
    ret.specialties = bde.specialties
      ? bde.specialties.map((spe) => SpecialtyType.fromSpecialtyModel(spe))
      : [];
    return ret;
  }
}
