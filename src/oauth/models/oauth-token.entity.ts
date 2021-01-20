import {
  Column,
  Entity,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
  Unique,
} from 'typeorm';
import { ResourceOwner } from './resource-owner.entity';
import { OAuthAuthorizationCode } from './oauth-authorization-code.entity';
import moment from 'moment';

@Entity()
@Unique('UQ_access_token', ['access_token'])
export class OAuthToken {
  // Attributes

  @PrimaryColumn()
  refresh_token: string;

  @Column()
  access_token: string;

  @Column({ type: 'timestamp with time zone' })
  issued_at: Date;

  @Column({ type: 'timestamp with time zone' })
  expires_at: Date;

  @Column({ array: true, type: 'character varying' })
  scopes: string[];

  @OneToOne(() => OAuthAuthorizationCode, (client) => client.token)
  generation_code?: OAuthAuthorizationCode;

  @ManyToOne(() => ResourceOwner, (owner) => owner.authorization_codes, {
    nullable: false,
  })
  resource_owner: ResourceOwner;

  // Methods

  isExpired() {
    return moment().isAfter(this.expires_at);
  }

  hasScope(scope: string) {
    return this.scopes.includes(scope) || this.scopes.includes('all');
  }

}
