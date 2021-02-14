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
@Unique('UQ_access_token', ['accessToken'])
export class OAuthToken {
  // Attributes

  @PrimaryColumn()
  accessToken: string;

  @Column()
  refreshToken: string;

  @Column({ type: 'timestamp with time zone' })
  issuedAt: Date;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({ array: true, type: 'character varying' })
  scopes: string[];

  @OneToOne(() => OAuthAuthorizationCode, (client) => client.token)
  generationCode?: OAuthAuthorizationCode;

  @ManyToOne(() => ResourceOwner, (owner) => owner.authorizationCodes, {
    nullable: false,
  })
  resourceOwner: ResourceOwner;

  // Methods

  isExpired() {
    return moment().isAfter(this.expiresAt);
  }

  hasScope(scope: string) {
    return this.scopes.includes(scope) || this.scopes.includes('all');
  }
}
