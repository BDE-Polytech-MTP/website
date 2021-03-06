import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserType } from '../graphql/types/user.gql';
import { AccountService } from './account.service';
import { BdeResolver } from '../bde/bde.resolver';
import { BdeType } from '../graphql/types/bde.gql';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from '../oauth/guard/auth.guard';
import { User } from '../oauth/decorator/user.decorator';
import { ResourceOwner } from '../models/resource-owner.entity';

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

  @ResolveField('bde', () => BdeType)
  async getUserBde(@Parent() user: UserType) {
    return this.bdeResolver.getBDE(user.bdeId);
  }
}
