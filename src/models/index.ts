import { TypeOrmModule } from '@nestjs/typeorm';
import { OAuthClient } from './oauth-client.entity';
import { OAuthAuthorizationCode } from './oauth-authorization-code.entity';
import { OAuthToken } from './oauth-token.entity';
import { ResourceOwner } from './resource-owner.entity';
import { BDE } from './bde.entity';
import { Specialty } from './specialty.entity';
import { Survey } from './survey.entity';
import { SurveyChoice } from './survey-choice.entity';
import { Event } from './event.entity';
import { Booking } from './booking.entity';
import { EventSpecification } from './event-specification.entity';

export function typeOrmModule() {
  return TypeOrmModule.forFeature([
    OAuthClient,
    OAuthAuthorizationCode,
    OAuthToken,
    ResourceOwner,
    BDE,
    Specialty,
    Survey,
    SurveyChoice,
    Event,
    Booking,
    EventSpecification,
  ]);
}
