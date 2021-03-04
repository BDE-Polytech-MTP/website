import { Test, TestingModule } from '@nestjs/testing';
import { ResourceOwner } from '../models/resource-owner.entity';
import { EventsService } from './events.service';
import { ForbiddenException } from '@nestjs/common';
import { Event } from '../models/event.entity';
import { mockRepository } from '../../test/mock/utils';

describe('EventsService', () => {
  let service: EventsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventsService, mockRepository(Event)],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createEvent', () => {
    it('should throw ForbiddenException if creator does not have WRITE_EVENTS role', () => {
      const ro = new ResourceOwner();
      ro.roles = [];

      const result = service.createEvent(null, ro);

      return expect(result).rejects.toThrow(ForbiddenException);
    });
  });
});
