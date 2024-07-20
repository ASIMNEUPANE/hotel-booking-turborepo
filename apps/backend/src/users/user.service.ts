import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptPass } from '../utils/Bcrypt';
import { CreateUserDto } from './dtos/CreateUser.dto';
import {
  BlockUserDto,
  DeleteUserDto,
  ResetPasswordDto,
} from './dtos/update-user.dto';
import { getReturn } from '@repo/common/src/types/type';
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private bcrpt: BcryptPass,
  ) {}

  async createUser(
    payload: CreateUserDto,
  ): Promise<Prisma.UserCreateInput | null> {
    const { password, ...rest } = payload as {
      password: string;
      roles?: string[];
      [key: string]: any;
    };
    rest.password = await this.bcrpt.hashPassword(password);
    rest.isEmailVerified = true;
    rest.isActive = true;

    const result = await this.prisma.user.create({
      data: rest as Prisma.UserUncheckedCreateInput,
    });
    return result;
  }

  async getUser(
    limit?: number,
    page?: number,
    search?: { roles?: string },
  ): Promise<getReturn> {
    const pageNum = page;
    const size = limit;

    const whereCondition: any = {
      isActive: true,
      isArchive: false,
    };
    if (search.roles) {
      whereCondition.roles = search.roles;
    }

    // Get total count
    const total = await this.prisma.user.count({
      where: whereCondition,
    });

    // Fetch paginated data
    const data = await this.prisma.user.findMany({
      where: whereCondition,
      skip: (pageNum - 1) * size,
      take: size,
    });

    return { data, total, limit: size, page: pageNum };
  }
  async getById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
  }
  async updateById(id: string, payload: Prisma.UserUpdateInput) {
    return await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        name: payload?.name,
      },
    });
  }

  async changePassword(id: string, oldPassword: string, newPassword: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    const isValidOldPass = await this.bcrpt.comparePasswords(
      oldPassword,
      user?.password,
    );
    if (!isValidOldPass)
      throw new HttpException(
        'oldPassword is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    const newPass = await this.bcrpt.hashPassword(newPassword);

    return await this.prisma.user.update({
      where: { id },
      data: { password: newPass },
    });
  }

  async resetPassword(id: string, payload: ResetPasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);

    const newPass = await this.bcrpt.hashPassword(payload.password);

    return await this.prisma.user.update({
      where: { id },
      data: { password: newPass },
    });
  }
  async block(id: string, payload: BlockUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);

    return await this.prisma.user.update({
      where: { id },
      data: { isActive: payload?.isActive },
    });
  }
  async archive(id: string, payload: DeleteUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);

    return await this.prisma.user.update({
      where: { id },
      data: { isArchive: payload?.isArchive },
    });
  }
}
