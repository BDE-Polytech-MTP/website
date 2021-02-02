import { Column, Entity, ManyToOne } from 'typeorm';
import { BDE } from './bde.entity';
import { Event } from './event.entity';

@Entity()
export class EventSpecification {
  @Column({ type: 'int' })
  schoolPlacesCount: number;

  @Column({ type: 'int' })
  externPlacesCount: number;

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
