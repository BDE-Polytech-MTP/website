import { Field, Int, ObjectType, OmitType } from '@nestjs/graphql';
import { Specialty } from '../../models/specialty.entity';
import { ResourceOwner } from '../../models/resource-owner.entity';

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

@ObjectType('userSpecialty')
export class UserSpecialtyType extends OmitType(SpecialtyType, [
  'longName',
] as const) {
  static fromResourceOwner(ro: ResourceOwner) {
    const spe = new UserSpecialtyType();
    spe.shortName = ro.specialtyName;
    spe.year = ro.specialtyYear;
    return spe;
  }
}
