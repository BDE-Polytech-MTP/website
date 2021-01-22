import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { OAuthAuthorizationCode } from './oauth-authorization-code.entity';
import { OAuthToken } from './oauth-token.entity';

@Entity()
@Unique('UQ_email', ['email'])
export class ResourceOwner {
  // Columns

  @PrimaryGeneratedColumn('uuid')
  resourceOwnerId: string;

  @Column()
  email: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ nullable: true }) // If password is null, the resource owner didn't finish it's registration
  password: string;

  @Column({ nullable: true })
  resetPasswordToken: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true }) // If membership_date is null, the resource owner isn't a member
  membershipDate: Date;

  @Column({ nullable: true })
  sponsorResourceOwnerId: string;

  // Relationships

  @ManyToOne(() => ResourceOwner, (user) => user.sponsored)
  sponsor: ResourceOwner;

  @OneToMany(() => ResourceOwner, (user) => user.sponsored)
  sponsored: ResourceOwner[];

  @OneToMany(() => OAuthAuthorizationCode, (code) => code.resourceOwner)
  authorizationCodes: OAuthAuthorizationCode[];

  @OneToMany(() => OAuthToken, (token) => token.resourceOwner)
  tokens: OAuthToken[];

  // Methods

  get isMember() {
    return this.membershipDate !== null;
  }

  get isExtern() {
    return this.sponsorResourceOwnerId;
  }
}
