import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BdeType } from '../graphql/types/bde.gql';
import { BdeService } from './bde.service';
import { BdeAdminDto, SpecialtyDto } from './dto/create-bde.dto';
import { SpecialtyType } from '../graphql/types/specialty.gql';

@Resolver(() => BdeType)
export class BdeResolver {
  constructor(private bdeService: BdeService) {}

  @Query(() => [BdeType], { name: 'allBDE' })
  async getBDEs() {
    const bdes = await this.bdeService.getAllBDE();
    return bdes.map((bde) => {
      const bdeType = new BdeType();
      bdeType.id = bde.id;
      bdeType.name = bde.name;
      return bdeType;
    });
  }

  @Mutation(() => BdeType, { name: 'newBDE' })
  async createBDE(
    @Args('name') name: string,
    @Args('specialties', {
      defaultValue: [
        {
          shortName: 'PEIP',
          longName: 'Cycle préparatoire',
          year: 1,
        },
        {
          shortName: 'PEIP',
          longName: 'Cycle préparatoire',
          year: 2,
        },
      ],
      type: () => [SpecialtyDto],
    })
    specialties: SpecialtyDto[],
    @Args('admin') admin: BdeAdminDto,
  ) {
    const result = await this.bdeService.createBDE({
      name,
      admin,
      specialties: specialties.flatMap((spe) =>
        spe.years.map((year) => ({
          name: spe.shortName,
          fullName: spe.longName,
          year,
        })),
      ),
    });
    const bde = new BdeType();
    bde.id = result.id;
    bde.name = result.name;
    bde.specialties = result.specialties.map((spe) => {
      const s = new SpecialtyType();
      s.longName = spe.fullName;
      s.shortName = spe.name;
      s.year = spe.year;
      return s;
    });
    return bde;
  }
}
