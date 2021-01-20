import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryColumn,
} from 'typeorm';
import { OAuthClient } from './oauth-client.entity';
import { ResourceOwner } from './resource-owner.entity';
import { OAuthToken } from './oauth-token.entity';
import moment from 'moment';

const AUTHORIZATION_CODE_VALIDITY_DURATION = 10 * 60; // In seconds

@Entity()
export class OAuthAuthorizationCode {
  @PrimaryColumn()
  code: string;

  @Column({ type: 'timestamp with time zone' })
  issued_at: Date;

  @Column({ array: true, type: 'character varying' })
  scopes: string[];

  @ManyToOne(() => OAuthClient, (client) => client.authorization_codes, {
    nullable: false,
  })
  client: OAuthClient;

  @ManyToOne(() => ResourceOwner, (owner) => owner.authorization_codes, {
    nullable: false,
  })
  resource_owner: ResourceOwner;

  @OneToOne(() => OAuthToken, (token) => token.generation_code)
  @JoinColumn()
  token?: OAuthToken;

  hasAlreadyBeenUsed() {
    return !!this.token;
  }

  isExpired() {
    return moment()
      .subtract(AUTHORIZATION_CODE_VALIDITY_DURATION, 's')
      .isAfter(this.issued_at);
  }

  hasBeenGeneratedBy(clientId: string, clientSecret: string) {
    return (
      clientId === this.client.client_id &&
      clientSecret === this.client.client_secret
    );
  }
}
