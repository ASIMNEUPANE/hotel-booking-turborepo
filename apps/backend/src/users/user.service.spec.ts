import { Test, TestingModule } from '@nestjs/testing';
import { BcryptPass } from '../utils/Bcrypt';
import { Roles } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

import { HttpException, HttpStatus } from '@nestjs/common';
import { UserService } from './user.service';
const UserArray = [
  {
    id: '1',
    name: 'Asim Neupane',
    email: 'asimneupane11@gmail.com',
    password: 'hashPassword',
    isEmailVerified: true,
    isActive: true,
    isArchive: false,
    images: 'https://example.com/profile.jpg',
    roles: [Roles.ADMIN],
    created_by: '2',
    updated_by: '2',
    room: {},
  },
  {
    id: '2',
    name: 'new user',
    email: 'newuser@gmail.com',
    password: 'hashPassword',
    isEmailVerified: true,
    isActive: true,
    isArchive: false,
    images: 'https://example.com/profile.jpg',
    roles: [Roles.ADMIN],
    created_by: '2',
    updated_by: '2',
    room: {},
  },
];

const registerData = {
  name: 'Asim Neupane',
  email: 'asimneupane11@gmail.com',
  images: 'asimadmin.jpg',
  password: 'Helloworld@2',
};

describe('BlogService', () => {
  let service: UserService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: {
            user: {
              create: jest.fn(),
              count: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
        BcryptPass,
      ],
    }).compile();

    service = await module.get<UserService>(UserService);
    prismaService = await module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('create a user directly', () => {
    it('should create a user', async () => {
      jest
        .spyOn(BcryptPass.prototype, 'hashPassword')
        .mockResolvedValue('hashPassword');
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(UserArray[0]);
      const result = await service.createUser(registerData);
      expect(result).toEqual(UserArray[0]);
      expect(BcryptPass.prototype.hashPassword).toHaveBeenCalledWith(
        registerData.password,
      );
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: {
          ...registerData,
          isEmailVerified: true,
          isActive: true,
          password: 'hashPassword',
        },
      });
    });
  });
  describe('getUser', () => {
    it('should return a user', async () => {
      // Mock input data
      const limit = 1;
      const page = 1;
      const search = { roles: 'ADMIN' };

      // Mock PrismaService calls
      const totalCount = 3;
      const paginatedData = [UserArray[0], UserArray[1]];

      jest.spyOn(prismaService.user, 'count').mockResolvedValue(totalCount);
      jest
        .spyOn(prismaService.user, 'findMany')
        .mockResolvedValue(paginatedData);

      // Execute the method
      const result = await service.getUser(limit, page, search);
      console.log(result, '==========');
      // Verify the result
      expect(result).toEqual({
        data: paginatedData,
        total: totalCount,
        limit,
        page,
      });
    });
  });
  describe('getById', () => {
    it('should get the user by id', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(UserArray[0]);
      const result = await service.getById('1');
      expect(result).toEqual(UserArray[0]);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('updateById', () => {
    it('should update a user by id', async () => {
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(UserArray[0]);
      const result = await service.updateById(UserArray[0].id, {
        name: 'Asim Neupane',
      });
      expect(result).toEqual(UserArray[0]);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: UserArray[0].id },
        data: {
          name: 'Asim Neupane',
        },
      });
    });
  });

  describe('changePassword', () => {
    it('should change password', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(UserArray[0]);
      jest
        .spyOn(BcryptPass.prototype, 'comparePasswords')
        .mockResolvedValue(true);
      jest
        .spyOn(BcryptPass.prototype, 'hashPassword')
        .mockResolvedValue('hashPassword');
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(UserArray[0]);

      const result = await service.changePassword(
        '1',
        'oldPassword',
        'newPassword',
      );
      expect(result).toEqual(UserArray[0]);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(BcryptPass.prototype.comparePasswords).toHaveBeenCalledWith(
        'oldPassword',
        'hashPassword',
      );
      expect(BcryptPass.prototype.hashPassword).toHaveBeenCalledWith(
        'newPassword',
      );
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: UserArray[0].id },
        data: { password: 'hashPassword' },
      });
    });
    it('should throw an error if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        service.changePassword('1', 'oldPassword', 'newPassword'),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
    it('should throw an error if user is not found', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(UserArray[0]);
      jest
        .spyOn(BcryptPass.prototype, 'comparePasswords')
        .mockResolvedValue(false);
      await expect(() =>
        service.changePassword('1', 'oldPassword', 'newPassword'),
      ).rejects.toThrow(
        new HttpException('oldPassword is incorrect', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(BcryptPass.prototype.hashPassword).toHaveBeenCalledWith(
        'newPassword',
      );
    });
  });
  describe('resetPassword', () => {
    it('should reset user password', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(UserArray[0]);
      jest
        .spyOn(BcryptPass.prototype, 'hashPassword')
        .mockResolvedValue('hashPassword');
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(UserArray[0]);

      const result = await service.resetPassword('1', {
        password: 'helloworld',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(BcryptPass.prototype.hashPassword).toHaveBeenCalledWith(
        'helloworld',
      );
      expect(result).toEqual(UserArray[0]);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { password: 'hashPassword' },
      });
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        service.resetPassword('1', { password: 'newPassword' }),
      ).rejects.toThrow(
        new HttpException('User not found', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('block', () => {
    it('should block user', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(UserArray[0]);
      const payload = { isActive: false };
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(UserArray[0]);
      const result = await service.block('1', payload);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(UserArray[0]);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isActive: false },
      });
    });

    it('should throw error if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      const payload = { isActive: false };

      await expect(() => service.block('1', payload)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.BAD_REQUEST),
      );
    });
  });

  describe('archive', () => {
    it('should archive user', async () => {
      const payload = { isArchive: true };
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(UserArray[0]);
      jest.spyOn(prismaService.user, 'update').mockResolvedValue(UserArray[0]);

      const result = await service.archive('1', payload);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(result).toEqual(UserArray[0]);
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isArchive: true },
      });
    });

    it('should throw error if user not found', async () => {
      const payload = { isArchive: true };
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

      await expect(() => service.archive('1', payload)).rejects.toThrow(
        new HttpException('User not found', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});
