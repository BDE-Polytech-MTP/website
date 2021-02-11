import { Test, TestingModule } from '@nestjs/testing';
import { BdeService } from './bde.service';
import { mockRepository } from '../../test/mock/utils';
import { BDE, UQ_NAME_CONSTRAINT } from '../models/bde.entity';
import { Specialty } from '../models/specialty.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { AccountService } from '../account/account.service';

describe('BdeService', () => {
  let service: BdeService;
  let bdeRepository: Repository<BDE>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BdeService,
        mockRepository(BDE),
        mockRepository(Specialty),
        {
          provide: AccountService,
          useValue: {
            createAccount: () => {
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get<BdeService>(BdeService);
    bdeRepository = module.get(getRepositoryToken(BDE));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createBDE', () => {
    it('should throw BadRequestException if a BDE with the given name already exist', () => {
      jest.spyOn(bdeRepository, 'save').mockImplementation(async () => {
        throw { constraint: UQ_NAME_CONSTRAINT };
      });

      const result = service.createBDE({
        name: 'already-taken',
        specialties: [],
        admin: {
          firstname: 'Florent',
          lastname: 'Hugouvieux',
          email: 'florent.hugouvieux@domain.tld',
        },
      });

      return expect(result).rejects.toThrow(BadRequestException);
    });

    it('should resolve if BDE creation successes', () => {
      jest.spyOn(bdeRepository, 'save').mockImplementation(async (bde) => {
        bde.id = 'bde-id';
        return bde as BDE;
      });

      const result = service.createBDE({
        name: 'already-taken',
        specialties: [],
        admin: {
          firstname: 'Florent',
          lastname: 'Hugouvieux',
          email: 'florent.hugouvieux@domain.tld',
        },
      });

      return expect(result).resolves.toBeTruthy();
    });
  });
});
