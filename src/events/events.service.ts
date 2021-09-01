import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Role } from '../account/roles';
import { EventSpecification } from '../models/event-specification.entity';
import { Event } from '../models/event.entity';
import { ResourceOwner } from '../models/resource-owner.entity';
import { SurveyChoice } from '../models/survey-choice.entity';
import { Survey } from '../models/survey.entity';
import { Repository } from 'typeorm';
import { CreateEventDto } from './dto/event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event) private eventsRepository: Repository<Event>,
  ) {}

  async createEvent(eventSpecif: CreateEventDto, creator: ResourceOwner) {
    if (!creator.roles.includes(Role.WRITE_EVENTS)) {
      throw new ForbiddenException(`You must have ${Role.WRITE_EVENTS} role.`);
    }

    const event = new Event();
    event.title = eventSpecif.title;
    event.description = eventSpecif.description;
    event.limitedToMembers = eventSpecif.limitedToMembers;
    event.bookingStart = eventSpecif.bookingStart;
    event.bookingEnd = eventSpecif.bookingEnd;
    event.organizerId = creator.bdeId;

    event.specifications = eventSpecif.places.map((spec) => {
      const places = new EventSpecification();
      places.bdeId = spec.bde;
      places.externPlacesCount = event.limitedToMembers
        ? 0
        : spec.forExterns < 0
        ? null
        : spec.forExterns;
      places.schoolPlacesCount = spec.forSchool < 0 ? null : spec.forSchool;
      return places;
    });

    event.surveys = eventSpecif.surveys.map((spec) => {
      const survey = new Survey();
      survey.title = spec.title;
      survey.description = spec.description;
      survey.limitedToMembers = spec.limitedToMembers;
      survey.required = spec.required;

      survey.choices = spec.choices.map((c) => {
        const choice = new SurveyChoice();
        choice.limit = c.max;
        choice.title = c.name;
        return choice;
      });

      return survey;
    });

    return await this.eventsRepository.save(event);
  }
}
