import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptPass {
  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, +process.env.SALT_ROUND);
  }

  async comparePasswords(
    plainTextPassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hashedPassword);
  }
}
