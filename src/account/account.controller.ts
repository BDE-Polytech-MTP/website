import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import {
  PasswordResetDto,
  SendPasswordResetEmailDto,
} from './dto/password-reset.dto';

/**
 * This controller handles all requests relative to account management.
 */
@Controller('api/account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  /**
   * Checks if the given token is a valid reset password token.
   *
   * @param token The token generated when requested a password reset
   */
  @Get('password-reset/check')
  async checkResetPasswordToken(@Query('token') token: string) {
    return this.accountService.checkResetPasswordToken(token);
  }

  /**
   * Resets the password the of the account the given token was generated for.
   * The new password for this account is set to the one given in the body of
   * the request.
   *
   * @param token The token generated when requested a password reset
   * @param body
   */
  @Post('password-reset/reset')
  async doResetPassword(
    @Query('token') token: string,
    @Body() body: PasswordResetDto,
  ) {
    return this.accountService.resetPassword(token, body.password);
  }

  /**
   * Sends an email with a link allowing the owner of the account
   * with the email address given in the body of the request to define
   * a new password for his or her account.
   *
   * @param body
   */
  @Post('password-reset/send')
  async askForReset(@Body() body: SendPasswordResetEmailDto) {
    return this.accountService.sendPasswordResetEmail(body.email);
  }
}
