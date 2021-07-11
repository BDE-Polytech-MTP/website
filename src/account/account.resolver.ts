import { Args, Parent, Query, ResolveField, Resolver, Mutation } from '@nestjs/graphql';
import { UserType } from '../graphql/types/user.gql';
import { AccountService } from './account.service';
import { BdeResolver } from '../bde/bde.resolver';
import { BdeType } from '../graphql/types/bde.gql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../oauth/guard/auth.guard';
import { User } from '../oauth/decorator/user.decorator';
import { ResourceOwner } from '../models/resource-owner.entity';
import { BdeAdminDto, SpecialtyDto } from '../bde/dto/create-bde.dto';

@Resolver(() => UserType)
export class AccountResolver {
  constructor(
    private accountService: AccountService,
    private bdeResolver: BdeResolver,
  ) {}

  /**
   * Allows to retrieve information of the authenticated user.
   *
   * @param user The authenticated user
   */
  @Query(() => UserType, { name: 'me' })
  @UseGuards(AuthGuard)
  async me(@User() user: ResourceOwner) {
    return UserType.fromResourceOwnerModel(user);
  }

  /**
   * Allows to retrieve information of the user with the given id.
   *
   * @param id The uuid of the user
   */
  @Query(() => UserType, { name: 'user' })
  async getUser(@Args('id') id: string) {
    const resourceOwner = await this.accountService.getAccountById(id);
    return UserType.fromResourceOwnerModel(resourceOwner);
  }

  @Mutation(() => UserType, { name: 'newAccount' })
  async createAccountToValidate (
    @Args('mail')
      mail: string,
    @Args('firstN')
      firstN: string,
    @Args('lastN')
      lastN: string,
  ) {
    console.log("On passe ");
    //Assume that only one BDE id there
    this.bdeResolver.getBDEs()
      .then(bde => {
          console.log(bde[0].id);

          this.accountService.createAccountToValidate(mail, firstN, lastN, bde[0].id)
            .then(result => {
              return UserType.fromResourceOwnerModel(result);
            });
      }
    )
      .catch(() => {
        console.log("Une erreur est survenue dans la récupération des informations du BDE.");
      })
    //console.log(await this.bdeResolver.getBDE(await this.bdeResolver.getBDEs()[0].id));
  }

  @ResolveField('bde', () => BdeType)
  async getUserBde(@Parent() user: UserType) {
    return this.bdeResolver.getBDE(user.bdeId);
  }
}
