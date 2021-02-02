import { Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
import { BDE } from './bde.entity';

@Entity()
export class Specialty {
  @PrimaryColumn()
  name: string;

  @PrimaryColumn({ type: 'int' })
  year: number;

  @Column()
  fullName: string;

  @PrimaryColumn()
  bdeID: string;

  // Relationships

  @ManyToOne(() => BDE, (bde) => bde.specialties, {
    primary: true,
  })
  bde: BDE;
}
