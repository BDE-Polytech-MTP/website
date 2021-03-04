import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import { IsEmail, IsString, MinLength } from 'class-validator';

class ResetPasswordRequest {
  @IsString()
  @MinLength(10)
  password: string;
}

class SendResetEmailRequest {
  @IsEmail()
  email: string;
}

@Controller('api/account')
export class AccountController {
  constructor(private accountService: AccountService) {}

  @Get('password-reset/check')
  async checkResetPasswordToken(@Query('token') token: string) {
    return this.accountService.checkResetPasswordToken(token);
  }

  @Post('password-reset/reset')
  async doResetPassword(
    @Query('token') token: string,
    @Body() body: ResetPasswordRequest,
  ) {
    return this.accountService.resetPassword(token, body.password);
  }

  @Post('password-reset/send')
  async askForReset(@Body() body: SendResetEmailRequest) {
    return this.accountService.sendPasswordResetEmail(body.email);
  }
}
