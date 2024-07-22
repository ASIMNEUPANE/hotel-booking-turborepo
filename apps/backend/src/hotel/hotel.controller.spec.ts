import { Test, TestingModule } from '@nestjs/testing';
import { HotelController } from './hotel.controller';
import { HotelService } from './hotel.service';
import { PrismaService } from '../prisma/prisma.service';

describe('HotelController', () => {
  let controller: HotelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HotelController],
      providers: [HotelService, PrismaService],
    }).compile();

    controller = module.get<HotelController>(HotelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
