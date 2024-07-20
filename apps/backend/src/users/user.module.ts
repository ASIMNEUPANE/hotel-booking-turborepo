import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { BcryptPass } from 'src/utils/Bcrypt';

@Module({
  imports: [],
  controllers: [UserController],
  providers: [UserService, BcryptPass],
})
export class UserModule {}
