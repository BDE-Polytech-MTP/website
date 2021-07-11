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
import { BDE } from './bde.entity';
import { Booking } from './booking.entity';
import { Role } from '../account/roles';
import { Specialty } from './specialty.entity';

export const UQ_EMAIL_CONSTRAINT = 'UQ_email';
export const UQ_RESET_PASSWORD_TOKEN_CONSTRAINT = 'UQ_RESET_PASSWORD_TOKEN';

@Entity()
@Unique(UQ_EMAIL_CONSTRAINT, ['email'])
@Unique(UQ_RESET_PASSWORD_TOKEN_CONSTRAINT, ['resetPasswordToken'])
export class ResourceOwner {
  // Columns

  @PrimaryGeneratedColumn('uuid')
  id: string;

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

  @Column({ nullable: true })
  resetPasswordTokenExpiration: Date;

  @Column({ type: 'character varying', array: true })
  roles: string[];

  @Column({ nullable: true }) // If membership_date is null, the resource owner isn't a member
  membershipDate: Date;

  @Column({ nullable: true })
  sponsorResourceOwnerId: string;

  // Foreign keys

  @Column({ nullable: true })
  specialtyName: string;

  @Column({ type: 'integer', nullable: true })
  specialtyYear: number;

  @Column()
  bdeId: string;
  
  @Column('boolean', { default: false })
  isValidateMember: boolean = false;

  // Relationships

  @ManyToOne(() => BDE, (bde) => bde.resourceOwners)
  bde: BDE;

  @ManyToOne(() => ResourceOwner, (user) => user.sponsored)
  sponsor: ResourceOwner;

  @OneToMany(() => ResourceOwner, (user) => user.sponsored)
  sponsored: ResourceOwner[];

  @OneToMany(() => OAuthAuthorizationCode, (code) => code.resourceOwner)
  authorizationCodes: OAuthAuthorizationCode[];

  @OneToMany(() => OAuthToken, (token) => token.resourceOwner)
  tokens: OAuthToken[];

  @OneToMany(() => Booking, (booking) => booking.resourceOwner)
  bookings: Booking[];

  @ManyToOne(() => Specialty, {
    nullable: true,
  })
  specialty: Specialty;

  // Methods

  get isMember() {
    return this.membershipDate !== null;
  }

  get isExtern() {
    return this.sponsorResourceOwnerId;
  }

  hasRole(role: Role) {
    return this.roles.includes(role);
  }
}
