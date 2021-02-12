import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BDE, UQ_NAME_CONSTRAINT } from '../models/bde.entity';
import { Repository } from 'typeorm';
import { Specialty } from '../models/specialty.entity';
import { AccountService } from '../account/account.service';
import { Role } from '../account/roles';

@Injectable()
export class BdeService {
  private readonly logger = new Logger(BdeService.name);

  constructor(
    @InjectRepository(BDE) private bdeRepository: Repository<BDE>,
    @InjectRepository(Specialty)
    private specialtyRepository: Repository<Specialty>,
    private accountService: AccountService,
  ) {}

  async createBDE(params: {
    name: string;
    specialties: {
      name: string;
      fullName: string;
      year: number;
    }[];
    admin: {
      firstname: string;
      lastname: string;
      email: string;
    };
  }) {
    // BDE Creation
    let bde = new BDE();
    bde.name = params.name;

    try {
      bde = await this.bdeRepository.save(bde);
    } catch (e) {
      if (e.constraint && e.constraint === UQ_NAME_CONSTRAINT) {
        throw new BadRequestException(
          'A BDE with the given name already exists',
        );
      }
      this.logger.error(e);
      throw new InternalServerErrorException('Unable to create this BDE');
    }

    // Specialties creation
    const specialties = params.specialties.map((spe) => {
      const specialty = new Specialty();
      specialty.bdeId = bde.id;
      specialty.name = spe.name;
      specialty.fullName = spe.fullName;
      specialty.year = spe.year;
      return specialty;
    });

    try {
      await this.specialtyRepository.save(specialties);
      bde.specialties = specialties;
    } catch (e) {
      try {
        await this.bdeRepository.delete(bde.id);
      } catch {}
      this.logger.error(e);
      throw new InternalServerErrorException();
    }

    // Admin creation
    try {
      await this.accountService.createAccount({
        email: params.admin.email,
        lastname: params.admin.lastname,
        firstname: params.admin.firstname,
        bde: bde.id,
        roles: [Role.WRITE_USERS, Role.READ_USERS],
      });
    } catch (e) {
      try {
        await this.bdeRepository.delete(bde.id);
      } catch {}
      throw e;
    }

    return bde;
  }

  getAllBDE() {
    return this.bdeRepository.find({
      relations: ['specialties'],
    });
  }

  async getBdeById(id: string) {
    const bde = await this.bdeRepository.findOne(id, {
      relations: ['specialties'],
    });
    if (!bde) {
      throw new BadRequestException('Unable to find a BDE with the given ID');
    }
    return bde;
  }
}
