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
  issuedAt: Date;

  @Column({ array: true, type: 'character varying' })
  scopes: string[];

  @ManyToOne(() => OAuthClient, (client) => client.authorizationCodes, {
    nullable: false,
  })
  client: OAuthClient;

  @ManyToOne(() => ResourceOwner, (owner) => owner.authorizationCodes, {
    nullable: false,
  })
  resourceOwner: ResourceOwner;

  @OneToOne(() => OAuthToken, (token) => token.generationCode)
  @JoinColumn()
  token?: OAuthToken;

  hasAlreadyBeenUsed() {
    return !!this.token;
  }

  isExpired() {
    return moment()
      .subtract(AUTHORIZATION_CODE_VALIDITY_DURATION, 's')
      .isAfter(this.issuedAt);
  }

  hasBeenGeneratedBy(clientId: string, clientSecret: string) {
    return (
      clientId === this.client.clientID &&
      clientSecret === this.client.clientSecret
    );
  }
}
