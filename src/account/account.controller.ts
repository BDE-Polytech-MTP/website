import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { AccountService } from './account.service';
import { IsString, MinLength } from 'class-validator';

class ResetPasswordRequest {
  @IsString()
  @MinLength(10)
  password: string;
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
}
