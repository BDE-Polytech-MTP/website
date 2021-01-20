import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { OAuthAuthorizationCode } from './oauth-authorization-code.entity';
import { OAuthToken } from './oauth-token.entity';

@Entity()
@Unique('UQ_email', ['email'])
export class ResourceOwner {
  @PrimaryGeneratedColumn('uuid')
  resource_owner_id: string;

  @Column()
  email: string;

  @Column()
  firstname: string;

  @Column()
  lastname: string;

  @Column({ nullable: true }) // If password is null, the resource owner didn't finish it's registration
  password: string;

  @Column({ nullable: true })
  reset_password_token: string;

  @OneToMany(() => OAuthAuthorizationCode, (code) => code.resource_owner)
  authorization_codes: OAuthAuthorizationCode[];

  @OneToMany(() => OAuthToken, (token) => token.resource_owner)
  tokens: OAuthToken[];
}
