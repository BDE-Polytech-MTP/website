import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { OAuthAuthorizationCode } from './oauth-authorization-code.entity';

@Entity()
@Unique('UQ_client_name', ['clientName'])
export class OAuthClient {
  @PrimaryGeneratedColumn('uuid')
  clientID: string;

  @Column({
    type: 'enum',
    enum: ['public', 'confidential'],
  })
  clientType: string;

  @Column()
  clientName: string;

  @Column()
  redirectURI: string;

  @Column()
  clientSecret: string;

  @Column({ default: false })
  revoked: boolean;

  @OneToMany(() => OAuthAuthorizationCode, (code) => code.client)
  authorizationCodes: OAuthAuthorizationCode[];
}
