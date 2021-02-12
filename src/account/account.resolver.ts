import { Args, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UserType } from '../graphql/types/user.gql';
import { AccountService } from './account.service';
import { BdeResolver } from '../bde/bde.resolver';
import { BdeType } from '../graphql/types/bde.gql';

@Resolver(() => UserType)
export class AccountResolver {
  constructor(
    private accountService: AccountService,
    private bdeResolver: BdeResolver,
  ) {}

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
