import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Hotel } from '@repo/common/src/types/hotel.return.type';
import { getReturn } from '@repo/common/src/types/type';
import { UpdateHotelDto } from './dto/update-hotel.dto';

@Injectable()
export class HotelService {
  constructor(private prisma: PrismaService) {}

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    const res = await this.prisma.hotel.create({
      data: createHotelDto,
    });
    if (!res)
      throw new HttpException(
        'Hotel not created',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return res;
  }

  async findAll(
    limit?: number,
    page?: number,
    search?: { name?: string },
  ): Promise<getReturn> {
    const pageNum = page;
    const size = limit;

    const whereCondition: any = {
      isArchive: false,
    };
    if (search.name) {
      whereCondition.name = search.name;
    }
    try {
      const total = await this.prisma.hotel.count({
        where: whereCondition,
      });

      // Fetch paginated data
      const data = await this.prisma.hotel.findMany({
        where: whereCondition,
        skip: (pageNum - 1) * size,
        take: size,
      });

      return { data, total, limit: size, page: pageNum };
    } catch (e) {
      throw new HttpException(
        'Cannot get All hotels',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(id: string): Promise<Hotel | null> {
    const resp = await this.prisma.hotel.findUnique({
      where: { id },
    });
    if (!resp) throw new HttpException('Hotel not found', HttpStatus.NOT_FOUND);

    return resp;
  }

  async updateById(id: string, updateHotelDto: UpdateHotelDto) {
    const isHotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!isHotel)
      throw new HttpException('Hotel not found', HttpStatus.NOT_FOUND);
    const res = await this.prisma.hotel.update({
      where: { id },
      data: { ...updateHotelDto },
    });
    if (!res)
      throw new HttpException(
        'Hotel not updated',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return res;
  }

  async archive(id: string, isArchive: boolean) {
    const isHotel = await this.prisma.hotel.findUnique({ where: { id } });
    if (!isHotel)
      throw new HttpException('Hotel not found', HttpStatus.NOT_FOUND);
    const res = await this.prisma.hotel.update({
      where: { id },
      data: { isArchive },
    });
    if (!res)
      throw new HttpException(
        'Hotel not archive successfully',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    return res;
  }
}
