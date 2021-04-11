import { Field, ObjectType } from '@nestjs/graphql';
import { BdeType } from './bde.gql';
import { UserSpecialtyType } from './specialty.gql';
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

  @Field()
  membershipDate: Date;

  @Field(() => BdeType, { nullable: true })
  bde: BdeType;

  @Field(() => UserSpecialtyType, { nullable: true })
  specialty: UserSpecialtyType;

  static fromResourceOwnerModel(ro: ResourceOwner) {
    const user = new UserType();
    user.firstname = ro.firstname;
    user.lastname = ro.lastname;
    user.email = ro.email;
    user.bdeId = ro.bdeId;
    if (ro.specialtyName) {
      user.specialty = UserSpecialtyType.fromResourceOwner(ro);
    }
    if (ro.membershipDate) {
      user.membershipDate = ro.membershipDate;
    }
    return user;
  }
}
