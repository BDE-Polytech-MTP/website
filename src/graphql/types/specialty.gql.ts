import { Field, Int, ObjectType } from '@nestjs/graphql';
import { Specialty } from '../../models/specialty.entity';

@ObjectType('specialty')
export class SpecialtyType {
  @Field({ description: 'The acronym used to name the specialty' })
  shortName: string;

  @Field({ description: 'The long name of the specialty' })
  longName: string;

  @Field(() => Int)
  year: number;

  static fromSpecialtyModel(spe: Specialty) {
    const ret = new SpecialtyType();
    ret.year = spe.year;
    ret.longName = spe.fullName;
    ret.shortName = spe.name;
    return ret;
  }

}
