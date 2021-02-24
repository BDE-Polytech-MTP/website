import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  ResourceOwner,
  UQ_EMAIL_CONSTRAINT,
} from '../models/resource-owner.entity';
import { Repository } from 'typeorm';
import { Role } from './roles';
import { MailingService } from '../mailing/mailing.service';
import { uid } from 'rand-token';
import * as moment from 'moment';
import { PasswordService } from '../password/password.service';

@Injectable()
export class AccountService {

  private readonly logger = new Logger(AccountService.name);

  constructor(
    @InjectRepository(ResourceOwner)
    private resourceOwnerRepository: Repository<ResourceOwner>,
    private mailingService: MailingService,
    private passwordService: PasswordService,
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

    let user = new ResourceOwner();
    user.email = userData.email.toLowerCase();
    user.bdeId = userData.bde;
    user.firstname = userData.firstname;
    user.lastname = userData.lastname;
    user.membershipDate = userData.membershipDate;
    user.roles = userData.roles;
    this.updateResetPasswordToken(user);

    try {
      user = await this.resourceOwnerRepository.save(user);
    } catch (e) {
      if (e.constraint && e.constraint === UQ_EMAIL_CONSTRAINT) {
        throw new BadRequestException('An user with this email already exists');
      }
      throw new InternalServerErrorException('Unable to create account');
    }

    try {
      await this.mailingService.sendRegistrationMail(user);
    } catch {}
    return user;
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

  async getAccountById(id: string) {
    const resourceOwner = await this.resourceOwnerRepository.findOne(id, {
      relations: ['specialty'],
    });
    if (!resourceOwner) {
      throw new NotFoundException('No account with the given id can be found.');
    }
    return resourceOwner;
  }

  async checkResetPasswordToken(token: string) {
    const resourceOwner = await this.resourceOwnerRepository.findOne({
      where: {
        resetPasswordToken: token,
      },
    });
    if (
      !resourceOwner ||
      new Date() > resourceOwner.resetPasswordTokenExpiration
    ) {
      return { valid: false };
    }
    return { valid: true };
  }

  async resetPassword(token: string, password: string) {
    const valid = (await this.checkResetPasswordToken(token)).valid;
    if (!valid) {
      throw new BadRequestException('The given token is invalid');
    }
    const newPassword = await this.passwordService.hashPassword(password);
    await this.resourceOwnerRepository.update(
      {
        resetPasswordToken: token,
      },
      {
        resetPasswordToken: null,
        resetPasswordTokenExpiration: null,
        password: newPassword,
      },
    );
    return { ok: true };
  }

  private updateResetPasswordToken(user: ResourceOwner) {
    user.resetPasswordToken = uid(32);
    user.resetPasswordTokenExpiration = moment().add('24', 'h').toDate();
  }

  async sendPasswordResetEmail(email: string) {
    const ro = await this.resourceOwnerRepository.findOne({
      where: {
        email
      }
    });

    if (ro) {
      this.updateResetPasswordToken(ro);
      try {
        await this.resourceOwnerRepository.update(ro.id, { resetPasswordToken: ro.resetPasswordToken, resetPasswordTokenExpiration: ro.resetPasswordTokenExpiration });
        await this.mailingService.sendResetPasswordMail(ro);
      } catch (e) {
        this.logger.error(e);
        throw new InternalServerErrorException({ ok: false });
      }
    }

    return { ok: true }
  }

}
