import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ResourceOwner,
  UQ_EMAIL_CONSTRAINT,
} from '../models/resource-owner.entity';
import { Repository } from 'typeorm';
import { Role } from './roles';

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(ResourceOwner)
    private resourceOwnerRepository: Repository<ResourceOwner>,
  ) {}

  async createAccount(
    userData: {
      firstname: string;
      email: string;
      lastname: string;
      bde: string;
      membershipDate?: Date;
      roles?: Role[];
    },
    creator?: ResourceOwner,
  ): Promise<ResourceOwner> {
    if (creator && !creator.hasRole(Role.WRITE_USERS)) {
      throw new ForbiddenException(
        'You must have the role WRITE_USERS to create an user',
      );
    }

    if (creator && creator.bdeId !== userData.bde) {
      throw new ForbiddenException(
        'You can only create an user in your own BDE',
      );
    }

    const user = new ResourceOwner();
    user.email = userData.email;
    user.bdeId = userData.bde;
    user.firstname = userData.firstname;
    user.lastname = userData.lastname;
    user.membershipDate = userData.membershipDate;
    user.roles = userData.roles;

    try {
      return await this.resourceOwnerRepository.save(user);
    } catch (e) {
      if (e.constraint && e.constraint === UQ_EMAIL_CONSTRAINT) {
        throw new BadRequestException('An user with this email already exists');
      }
      throw new InternalServerErrorException('Unable to create account');
    }
  }

  async updateAccount(
    userId: string,
    userData: {
      firstname?: string;
      lastname?: string;
      email?: string;
    },
    updater?: ResourceOwner,
  ) {
    const user = await this.resourceOwnerRepository.findOne(userId);

    if (!user) {
      throw new BadRequestException('No user with the given ID can be found');
    }

    if (updater && !updater.hasRole(Role.WRITE_USERS)) {
      throw new ForbiddenException(
        'You must have WRITE_USERS role to update an user',
      );
    }

    if (updater && updater.bdeId !== user.bdeId) {
      throw new ForbiddenException('You cannot update an user of an other BDE');
    }

    Object.assign(user, userData);

    try {
      return await this.resourceOwnerRepository.save(user);
    } catch (e) {
      if (e.constraint && e.constraint === UQ_EMAIL_CONSTRAINT) {
        throw new BadRequestException(
          'Cannot update user. The new given email is already taken',
        );
      }
      throw e;
    }
  }
}
