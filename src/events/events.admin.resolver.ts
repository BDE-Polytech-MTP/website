import { UseGuards } from '@nestjs/common';
import {
  Args,
  Field,
  ID,
  Mutation,
  ObjectType,
  Resolver,
} from '@nestjs/graphql';
import { UserEventType } from '../graphql/types/event.gql';
import { ResourceOwner } from '../models/resource-owner.entity';
import { User } from '../oauth/decorator/user.decorator';
import { AuthGuard } from '../oauth/guard/auth.guard';
import { CreateEventDto } from './dto/event.dto';
import { EventsService } from './events.service';

@ObjectType()
class EventCreation {
  @Field(() => ID)
  id: string;
}

@Resolver()
export class EventsAdminResolver {
  constructor(private eventsService: EventsService) {}

  @Mutation(() => EventCreation, { name: 'createEvent' })
  @UseGuards(AuthGuard)
  async createEvent(
    @User()
    user: ResourceOwner,
    @Args('event')
    event: CreateEventDto,
  ): Promise<EventCreation> {
    const createdEvent = await this.eventsService.createEvent(event, user);
    return { id: createdEvent.id };
  }
}
