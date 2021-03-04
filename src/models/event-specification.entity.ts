import { Column, Entity, ManyToOne } from 'typeorm';
import { BDE } from './bde.entity';
import { Event } from './event.entity';

@Entity()
export class EventSpecification {
  @Column({ type: 'int', nullable: true })
  schoolPlacesCount: number;

  @Column({ type: 'int', nullable: true })
  externPlacesCount: number;

  // Foreign keys

  @Column()
  bdeId: string;

  // Relationships

  @ManyToOne(() => BDE, {
    primary: true,
  })
  bde: BDE;

  @ManyToOne(() => Event, (event) => event.specifications, {
    primary: true,
  })
  event: Event;
}
