import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BdeType } from '../graphql/types/bde.gql';
import { BdeService } from './bde.service';
import { BdeAdminDto, SpecialtyDto } from './dto/create-bde.dto';

@Resolver(() => BdeType)
export class BdeResolver {
  constructor(private bdeService: BdeService) {}

  @Query(() => [BdeType], { name: 'allBDE' })
  async getBDEs() {
    const bdes = await this.bdeService.getAllBDE();
    return bdes.map((bde) => BdeType.fromBdeModel(bde));
  }

  @Query(() => BdeType, { name: 'bde' })
  async getBDE(@Args('id') id: string) {
    const bde = await this.bdeService.getBdeById(id);
    return BdeType.fromBdeModel(bde);
  }

  @Mutation(() => BdeType, { name: 'newBDE' })
  async createBDE(
    @Args('name')
    name: string,
    @Args('specialties', { type: () => [SpecialtyDto] })
    specialties: SpecialtyDto[],
    @Args('admin')
    admin: BdeAdminDto,
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
    return BdeType.fromBdeModel(result);
  }
}
