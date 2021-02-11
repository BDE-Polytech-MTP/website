import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ResourceOwner } from './resource-owner.entity';
import { Specialty } from './specialty.entity';

export const UQ_NAME_CONSTRAINT = 'UQ_NAME';

@Entity()
@Unique(UQ_NAME_CONSTRAINT, ['name'])
export class BDE {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  // Relationships

  @OneToMany(() => ResourceOwner, (resourceOwner) => resourceOwner.bde)
  resourceOwners: ResourceOwner[];

  @OneToMany(() => Specialty, (specialty) => specialty.bde, {
    onDelete: 'CASCADE'
  })
  specialties: Specialty[];
}
