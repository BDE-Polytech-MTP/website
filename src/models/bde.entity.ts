import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ResourceOwner } from './resource-owner.entity';
import { Specialty } from './specialty.entity';

@Entity()
@Unique('UQ_name', ['name'])
export class BDE {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Relationships

  @OneToMany(() => ResourceOwner, (resourceOwner) => resourceOwner.bde)
  resourceOwners: ResourceOwner[];

  @OneToMany(() => Specialty, (specialty) => specialty.bde)
  specialties: Specialty[];
}
