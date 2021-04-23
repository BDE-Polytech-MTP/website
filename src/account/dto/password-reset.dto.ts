import { IsEmail, IsString, MinLength } from 'class-validator';

export class PasswordResetDto {
  /**
   *  The new password for the account.
   */
  @IsString()
  @MinLength(10)
  password: string; // TODO: Use a @Password decorator to have a consistent password constraint policy
}

export class SendPasswordResetEmailDto {
  /**
   * The email of the account to request password-reset for.
   */
  @IsEmail()
  email: string;
}
