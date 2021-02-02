import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
  private saltRounds = 10;

  hashPassword(plainTextPassword: string): Promise<string> {
    return bcrypt.hash(plainTextPassword, this.saltRounds);
  }

  checkPassword(plainTextPassword, hashedPassword): Promise<boolean> {
    return bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
