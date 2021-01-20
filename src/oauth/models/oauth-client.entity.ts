import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { OAuthAuthorizationCode } from './oauth-authorization-code.entity';

@Entity()
@Unique('UQ_client_name', ['client_name'])
export class OAuthClient {
  @PrimaryGeneratedColumn('uuid')
  client_id: string;

  @Column({
    type: 'enum',
    enum: ['public', 'confidential'],
  })
  client_type: string;

  @Column()
  client_name: string;

  @Column()
  redirect_uri: string;

  @Column()
  client_secret: string;

  @Column({ default: false })
  revoked: boolean;

  @OneToMany(() => OAuthAuthorizationCode, (code) => code.client)
  authorization_codes: OAuthAuthorizationCode[];
}
