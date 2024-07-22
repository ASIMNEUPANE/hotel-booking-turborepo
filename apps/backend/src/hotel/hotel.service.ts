import { Injectable } from '@nestjs/common';
import { CreateHotelDto } from './dto/create-hotel.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Hotel } from '@repo/common/src/types/hotel.return.type';
import { getReturn } from '@repo/common/src/types/type';

@Injectable()
export class HotelService {
  constructor(private prisma: PrismaService) {}

  async create(createHotelDto: CreateHotelDto): Promise<Hotel> {
    console.log(createHotelDto);
    const res = await this.prisma.hotel.create({
      data: createHotelDto,
    });
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

    // Get total count
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
  }

  // async findOne(id: string): Promise<Hotel | null> {
  //   const resp = await this.prisma.hotel.findUnique({
  //     where: { id },
  //   });
  //   if (!resp) throw new HttpException('Hotel not found', HttpStatus.NOT_FOUND);

  //   return resp;
  // }

  // update(id: number, updateHotelDto: UpdateHotelDto) {
  //   return `This action updates a #${id} hotel`;
  // }

  // archive(id: number) {
  //   return `This action removes a #${id} hotel`;
  // }
}
