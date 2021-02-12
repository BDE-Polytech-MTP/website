import { Field, ObjectType } from '@nestjs/graphql';
import { BdeType } from './bde.gql';
import { SpecialtyType } from './specialty.gql';
import { ResourceOwner } from '../../models/resource-owner.entity';

@ObjectType()
export class UserType {
  @Field()
  firstname: string;

  @Field()
  lastname: string;

  @Field()
  email: string;

  @Field()
  bdeId: string;

  @Field(() => BdeType)
  bde: BdeType;

  @Field(() => SpecialtyType, { nullable: true })
  specialty: SpecialtyType;

  static fromResourceOwnerModel(ro: ResourceOwner) {
    const user = new UserType();
    user.firstname = ro.firstname;
    user.lastname = ro.lastname;
    user.email = ro.email;
    user.bdeId = ro.bdeId;
    user.specialty = ro.specialty
      ? SpecialtyType.fromSpecialtyModel(ro.specialty)
      : null;
    return user;
  }
}
