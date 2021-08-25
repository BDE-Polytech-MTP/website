import { Args, Parent, Query, ResolveField, Resolver, Mutation } from '@nestjs/graphql';
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
    return this.bdeResolver.getBDEs()
      .then(async bde => {
        console.log(bde[0].id);

        const result = await this.accountService.createAccountToValidate(mail, firstN, lastN, bde[0].id); //Assume that there is only one BDE.
        return UserType.fromResourceOwnerModel(result);
      }
    )
      .catch((e) => {
        console.error(e);
        console.error("Une erreur est survenue dans la récupération des informations du BDE.");
        const err = new ResourceOwner();
        return UserType.fromResourceOwnerModel(err);
      });
    //console.log(await this.bdeResolver.getBDE(await this.bdeResolver.getBDEs()[0].id));
  }

  @ResolveField('bde', () => BdeType)
  async getUserBde(@Parent() user: UserType) {
    return this.bdeResolver.getBDE(user.bdeId);
  }

  /**
   * Get all user who are not validate yet.
   */
  @Query(() => [UserType], {name: 'allUsers'})
  async getAllNonValidateUsersQ () {
    return this.accountService.getAllNonValidateUsers();
  }

  /**
   * Set a user to validate.
   * @param mail is the mail of the user we want to validate
   */
  @Mutation(() => UserType, { name: 'validateUser' })
  async ValidateAnAccount (
    @Args('mail')
      mail: string,
  ) {
    console.log("Notre mail reçu : " + mail);
    return await this.accountService.getAccountByEmail(mail)
      .then(async user => {
          const result = await this.accountService.validateUser(user);
          console.log("La validation de l'utilisateur a bien été effectuée ...");
          return UserType.fromResourceOwnerModel(result);
        }
      )
      .catch((e) => {
        console.error(e);
        console.error("Une erreur est survenue dans la récupération des informations du BDE ...");
        const err = new ResourceOwner();
        return UserType.fromResourceOwnerModel(err);
      });
  }

  /**
   * Delete users information from database. Inform the users by email.
   * @param mail is the mail of the user we want to validate
   */
  @Mutation(() => UserType, { name: 'deleteUser' })
  async UnvalidateAnAccount (
    @Args('mail')
      mail: string,
  ) {
    console.log("Notre mail reçu : " + mail);
    return await this.accountService.getAccountByEmail(mail)
      .then(async user => {
          const result = await this.accountService.unvalidateUser(user);
          console.log("La suppression de l'utilisateur a bien été effectuée ...");
          return UserType.fromResourceOwnerModel(result);
        }
      )
      .catch((e) => {
        console.error(e);
        console.error("Une erreur est survenue dans la récupération des informations du BDE ...");
        const err = new ResourceOwner();
        return UserType.fromResourceOwnerModel(err);
      });
  }
}
