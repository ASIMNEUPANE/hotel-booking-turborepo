import { Test, TestingModule } from '@nestjs/testing';
import { HotelService } from './hotel.service';
import { PrismaService } from '../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';

const prismaMock = {
  hotel: {
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
  },
};
const hotel = {
  id: '1',
  name: 'hotel',
  address: 'address',
  contact: 1234567890,
  email: 'asim@gmail.com',
  isArchive: false,
  img: 'img.jpg',
};

const Updatedhotel = {
  id: '1',
  name: 'hotel2',
  address: 'address',
  contact: 1234567890,
  email: 'asim@gmail.com',
  isArchive: true,
  img: 'img.jpg',
};

describe('HotelService', () => {
  let hotelService: HotelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HotelService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();

    hotelService = module.get<HotelService>(HotelService);
    prismaMock.hotel.findUnique.mockClear();
    prismaMock.hotel.findMany.mockClear();
    prismaMock.hotel.create.mockClear();
    prismaMock.hotel.count.mockClear();
    prismaMock.hotel.update.mockClear();
  });

  it('should be defined', () => {
    expect(hotelService).toBeDefined();
  });

  describe('create a hotel', () => {
    it('should create a hotel', async () => {
      prismaMock.hotel.create.mockResolvedValue(hotel);
      const res = await hotelService.create(hotel);
      expect(res).toEqual(hotel);
      expect(prismaMock.hotel.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.hotel.create).toHaveBeenCalledWith({ data: hotel });
    });
    it('should throw an error if hotel not created', async () => {
      prismaMock.hotel.create.mockResolvedValue(null);
      await expect(hotelService.create(hotel)).rejects.toThrow(
        new HttpException(
          'Hotel not created',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(prismaMock.hotel.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('find all hotels', () => {
    it('should return all hotels', async () => {
      prismaMock.hotel.count.mockResolvedValue(1);
      prismaMock.hotel.findMany.mockResolvedValue([hotel]);
      const res = await hotelService.findAll(1, 1, { name: 'hotel' });
      expect(res).toEqual({ data: [hotel], total: 1, limit: 1, page: 1 });
      expect(prismaMock.hotel.count).toHaveBeenCalledTimes(1);
      expect(prismaMock.hotel.findMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.hotel.findMany).toHaveBeenCalledWith({
        where: { isArchive: false, name: 'hotel' },
        skip: 0,
        take: 1,
      });
    });
    it('should throw an error if cannot get all hotels', async () => {
      prismaMock.hotel.count.mockRejectedValue(new Error());
      await expect(
        hotelService.findAll(1, 1, { name: 'hotel' }),
      ).rejects.toThrow(
        new HttpException(
          'Cannot get All hotels',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(prismaMock.hotel.count).toHaveBeenCalledTimes(1);
    });
  });

  describe('findById hotel', () => {
    it('should get one hotel by id', async () => {
      prismaMock.hotel.findUnique.mockResolvedValue(hotel);
      const res = await hotelService.findOne('1');
      expect(res).toEqual(hotel);
      expect(prismaMock.hotel.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.hotel.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
    it('should throw an error if not found', async () => {
      prismaMock.hotel.findUnique.mockResolvedValue(null);
      await expect(hotelService.findOne('1')).rejects.toThrow(
        new HttpException('Hotel not found', HttpStatus.NOT_FOUND),
      );
      expect(prismaMock.hotel.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('update hotel', () => {
    it('should update the hotel ', async () => {
      prismaMock.hotel.findUnique.mockResolvedValue(hotel);
      prismaMock.hotel.update.mockResolvedValue(Updatedhotel);
      const res = await hotelService.updateById('1', { name: 'hotel2' });
      expect(res).toEqual(Updatedhotel);
      expect(prismaMock.hotel.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.hotel.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.hotel.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { name: 'hotel2' },
      });
    });
    it('should throw an error if hotel id not found', async () => {
      prismaMock.hotel.findUnique.mockResolvedValue(null);
      await expect(
        hotelService.updateById('1', { name: 'hotel2' }),
      ).rejects.toThrow(
        new HttpException('Hotel not found', HttpStatus.NOT_FOUND),
      );
      expect(prismaMock.hotel.findUnique).toHaveBeenCalledTimes(1);
    });
    it('should throw an error if hotel  not updated', async () => {
      prismaMock.hotel.findUnique.mockResolvedValue(hotel);
      prismaMock.hotel.update.mockResolvedValue(null);
      await expect(
        hotelService.updateById('1', { name: 'hotel2' }),
      ).rejects.toThrow(
        new HttpException(
          'Hotel not updated',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(prismaMock.hotel.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.hotel.update).toHaveBeenCalledTimes(1);
    });
  });
  describe('Archive hotel', () => {
    it('should archive the hotel ', async () => {
      prismaMock.hotel.findUnique.mockResolvedValue(hotel);
      prismaMock.hotel.update.mockResolvedValue(Updatedhotel);
      const res = await hotelService.archive('1', true);
      expect(res).toEqual(Updatedhotel);
      expect(prismaMock.hotel.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.hotel.update).toHaveBeenCalledTimes(1);
      expect(prismaMock.hotel.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isArchive: true },
      });
    });
    it('should throw an error if hotel id not found', async () => {
      prismaMock.hotel.findUnique.mockResolvedValue(null);
      await expect(hotelService.archive('1', true)).rejects.toThrow(
        new HttpException('Hotel not found', HttpStatus.NOT_FOUND),
      );
      expect(prismaMock.hotel.findUnique).toHaveBeenCalledTimes(1);
    });
    it('should throw an error if hotel  not archive', async () => {
      prismaMock.hotel.findUnique.mockResolvedValue(hotel);
      prismaMock.hotel.update.mockResolvedValue(null);
      await expect(hotelService.archive('1', true)).rejects.toThrow(
        new HttpException(
          'Hotel not archive successfully',
          HttpStatus.INTERNAL_SERVER_ERROR,
        ),
      );
      expect(prismaMock.hotel.findUnique).toHaveBeenCalledTimes(1);
      expect(prismaMock.hotel.update).toHaveBeenCalledTimes(1);
    });
  });
});
