import { Module } from '@nestjs/common';
import { AuthsService } from './auths.service';
import { AuthsController } from './auths.controller';
import { BcryptPass } from 'src/utils/Bcrypt';

@Module({
  imports: [],

  controllers: [AuthsController],
  providers: [AuthsService, BcryptPass],
})
export class AuthsModule {}
