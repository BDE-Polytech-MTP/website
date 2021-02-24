import { Test, TestingModule } from '@nestjs/testing';
import { AccountService } from './account.service';
import { Repository } from 'typeorm';
import {
  ResourceOwner,
  UQ_EMAIL_CONSTRAINT,
} from '../models/resource-owner.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { mockRepository } from '../../test/mock/utils';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { Role } from './roles';
import { PasswordService } from '../password/password.service';
import { MailingService } from '../mailing/mailing.service';
import * as moment from 'moment';

describe('AccountService', () => {
  let service: AccountService;
  let resourceOwnerRepository: Repository<ResourceOwner>;

  const userData = {
    email: 'name@domain.tld',
    firstname: 'Florent',
    lastname: 'Hugouvieux',
    bde: 'bde-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AccountService,
        mockRepository(ResourceOwner),
        {
          provide: PasswordService,
          useValue: {
            checkPassword: async (plain, hashed) => plain === hashed,
            hashPassword: async (plain) => plain,
          },
        },
        {
          provide: MailingService,
          useValue: {
            sendRegistrationMail: () => {
              return undefined;
            },
          },
        },
      ],
    }).compile();

    service = module.get<AccountService>(AccountService);
    resourceOwnerRepository = module.get(getRepositoryToken(ResourceOwner));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create account', () => {
    it('should throw BadRequestException if email is already used', () => {
      jest
        .spyOn(resourceOwnerRepository, 'save')
        .mockImplementation(async () => {
          throw {
            constraint: UQ_EMAIL_CONSTRAINT,
          };
        });

      const result = service.createAccount(userData);

      return expect(result).rejects.toThrow(BadRequestException);
    });

    it('should pass a resource owner with a lowercased email when saving it', async () => {
      expect.assertions(1);
      jest
        .spyOn(resourceOwnerRepository, 'save')
        .mockImplementation(async (model) => {
          expect(model).toHaveProperty('email', 'lowercased')
          return model as ResourceOwner;
        });

      await service.createAccount({ firstname: 'Florent', lastname: 'Hugouvieux', email: 'LowerCased', bde: 'bde-uuid' });
    });

    it('should throw ForbiddenException if user creating the user do not have WRITE_USER role', () => {
      const creator = new ResourceOwner();
      creator.roles = [];

      const result = service.createAccount(userData, creator);

      return expect(result).rejects.toThrow(ForbiddenException);
    });

    it('should throw a ForbiddenException if user creating the user has WRITE_USER role but BDE UUIDs mismatch', () => {
      const creator = new ResourceOwner();
      creator.roles = [Role.WRITE_USERS];
      creator.bdeId = 'other-bde-uuid';

      const result = service.createAccount(userData, creator);

      return expect(result).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update account', () => {
    it('should throw BadRequestException if trying to update email to an already taken email', () => {
      jest
        .spyOn(resourceOwnerRepository, 'findOne')
        .mockImplementation(async () => new ResourceOwner());
      jest
        .spyOn(resourceOwnerRepository, 'save')
        .mockImplementation(async () => {
          throw {
            constraint: UQ_EMAIL_CONSTRAINT,
          };
        });

      const result = service.updateAccount('user-id', {});

      return expect(result).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if passed user id is invalid', () => {
      jest
        .spyOn(resourceOwnerRepository, 'findOne')
        .mockImplementation(async () => undefined);

      const result = service.updateAccount('user-id', {});
      return expect(result).rejects.toThrow(BadRequestException);
    });

    it('should throw ForbiddenException if updater has not role WRITE_USERS', () => {
      jest
        .spyOn(resourceOwnerRepository, 'findOne')
        .mockImplementation(async () => new ResourceOwner());
      const updater = new ResourceOwner();
      updater.roles = [];

      const result = service.updateAccount('user-id', {}, updater);

      return expect(result).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException if updated user and updater have different bde IDs', () => {
      jest
        .spyOn(resourceOwnerRepository, 'findOne')
        .mockImplementation(async () => {
          const user = new ResourceOwner();
          user.bdeId = 'bde-uuid';
          return user;
        });
      const updater = new ResourceOwner();
      updater.roles = [Role.WRITE_USERS];
      updater.bdeId = 'other-bde-uuid';

      const result = service.updateAccount('user-id', {}, updater);

      return expect(result).rejects.toThrow(ForbiddenException);
    });

    it('should return an user with updated properties when resolving', async () => {
      jest
        .spyOn(resourceOwnerRepository, 'findOne')
        .mockImplementation(async () => {
          const user = new ResourceOwner();
          user.firstname = 'John';
          user.lastname = 'Clément';
          user.email = 'john-clement@domain.tld';
          user.bdeId = 'bde-uuid';
          return user;
        });
      jest
        .spyOn(resourceOwnerRepository, 'save')
        .mockImplementation(async (user: ResourceOwner) => user);

      const result = await service.updateAccount('user-id', {
        firstname: 'Florent',
        lastname: 'Hugouvieux',
        email: 'florent.hug@domain.tld',
      });

      expect(result.firstname).toBe('Florent');
      expect(result.lastname).toBe('Hugouvieux');
      expect(result.email).toBe('florent.hug@domain.tld');
    });

    it('should resolve if updater has permission and has the same BDE is as the updated user', async () => {
      jest
        .spyOn(resourceOwnerRepository, 'findOne')
        .mockImplementation(async () => {
          const user = new ResourceOwner();
          user.bdeId = 'bde-uuid';
          return user;
        });
      const updater = new ResourceOwner();
      updater.roles = [Role.WRITE_USERS];
      updater.bdeId = 'bde-uuid';

      await service.updateAccount('user-id', {}, updater);
    });
  });

  describe('check password reset token', () => {
    it('should return "false" when providing unknown token', () => {
      jest
        .spyOn(resourceOwnerRepository, 'findOne')
        .mockImplementation(async () => undefined);

      const result = service.checkResetPasswordToken('the-token');

      return expect(result).resolves.toHaveProperty('valid', false);
    });

    it('should return "true" when providing valid unexpired token', () => {
      jest
        .spyOn(resourceOwnerRepository, 'findOne')
        .mockImplementation(async () => {
          const ro = new ResourceOwner();
          ro.resetPasswordTokenExpiration = moment().add(1, 'd').toDate();
          return ro;
        });

      const result = service.checkResetPasswordToken('the-token');

      return expect(result).resolves.toHaveProperty('valid', true);
    });

    it('should return "false" when providing expired token', () => {
      jest
        .spyOn(resourceOwnerRepository, 'findOne')
        .mockImplementation(async () => {
          const ro = new ResourceOwner();
          ro.resetPasswordTokenExpiration = moment().subtract(1, 'd').toDate();
          return ro;
        });

      const result = service.checkResetPasswordToken('the-token');

      return expect(result).resolves.toHaveProperty('valid', false);
    });
  });

  describe('reset password', () => {
    it('should throw BadRequestException if token is not valid', () => {
      jest
        .spyOn(service, 'checkResetPasswordToken')
        .mockImplementation(async () => ({
          valid: false,
        }));

      const result = service.resetPassword('token', 'password');

      return expect(result).rejects.toThrow(BadRequestException);
    });

    it('should reset password and delete token if token is valid', async () => {
      jest
        .spyOn(service, 'checkResetPasswordToken')
        .mockImplementation(async () => ({
          valid: true,
        }));
      const theSpy = jest.spyOn(resourceOwnerRepository, 'update');

      const result = await service.resetPassword('token', 'password');

      expect(result).toHaveProperty('ok', true);
      expect(theSpy).toHaveBeenCalledWith(
        {
          resetPasswordToken: 'token',
        },
        {
          resetPasswordToken: null,
          resetPasswordTokenExpiration: null,
          password: 'password',
        },
      );
    });
  });
});
