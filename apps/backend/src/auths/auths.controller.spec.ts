import { Test, TestingModule } from '@nestjs/testing';
import { AuthsController } from './auths.controller';
import { AuthsService } from './auths.service';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptPass } from '../utils/Bcrypt';

describe('AuthsController', () => {
  let controller: AuthsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthsController],
      providers: [AuthsService, PrismaService, BcryptPass],
    }).compile();

    controller = module.get<AuthsController>(AuthsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
