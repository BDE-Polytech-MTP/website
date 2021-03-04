import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { EventType } from '../graphql/types/event.gql';
import { ResourceOwner } from '../models/resource-owner.entity';
import { User } from '../oauth/decorator/user.decorator';
import { AuthGuard } from '../oauth/guard/auth.guard';
import { CreateEventDto } from './dto/event.dto';
import { EventsService } from './events.service';

@Resolver()
export class EventsResolver {
  constructor(private eventsService: EventsService) {}

  @Mutation(() => EventType, { name: 'createEvent' })
  @UseGuards(AuthGuard)
  async createEvent(
    @User()
    user: ResourceOwner,
    @Args('event')
    event: CreateEventDto,
  ) {
    const result = await this.eventsService.createEvent(event, user);
    return { id: result.id };
  }
}
