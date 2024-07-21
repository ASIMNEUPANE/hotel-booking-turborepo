import { Test, TestingModule } from '@nestjs/testing';
import { AuthsService } from './auths.service';
import { PrismaService } from '../prisma/prisma.service';
import { BcryptPass } from '../utils/Bcrypt';
import { Roles } from '@prisma/client';
import * as OTP from '../utils/otp';
import * as mail from '../utils/mailer';
import * as JWT from '../utils/jwt';
import { HttpException, HttpStatus } from '@nestjs/common';

const expectedResult = {
  id: '1',
  name: 'Asim Neupane',
  email: 'asimneupane11@gmail.com',
  password: 'hashPassword',
  isEmailVerified: true,
  isActive: true,
  isArchive: false,
  roles: [Roles.ADMIN],
  created_by: '2',
  updated_by: '3',
};

const registerData = {
  name: 'Asim Neupane',
  email: 'asimneupane11@gmail.com',
  images: 'asimadmin.jpg',
  password: 'Helloworld@2',
};
const authData = {
  email: registerData.email,
  otp: '123456',
};

const authDbdata = {
  id: '1',
  email: registerData.email,
  otp: '123456',
};
describe('AuthsService', () => {
  let service: AuthsService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthsService,
        {
          provide: PrismaService,
          useValue: {
            auth: {
              create: jest.fn(),
              count: jest.fn(),
              findMany: jest.fn(),
              findUnique: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            user: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
          },
        },
        BcryptPass,
      ],
    }).compile();

    service = await module.get<AuthsService>(AuthsService);
    prismaService = await module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register user', () => {
    it('should register new user and give otp', async () => {
      jest
        .spyOn(BcryptPass.prototype, 'hashPassword')
        .mockResolvedValue('hashPassword');

      jest
        .spyOn(prismaService.user, 'create')
        .mockResolvedValue(expectedResult);
      jest.spyOn(OTP, 'generateOTP').mockReturnValue('123456' as never);
      jest.spyOn(prismaService.auth, 'create').mockResolvedValue({
        id: '1',
        email: 'asimneupane11@gmail.com',
        otp: '123456',
      });
      jest.spyOn(mail, 'mailer').mockResolvedValue('email@succesjiahdabidna');
      const result = await service.register(registerData);
      expect(result).toEqual(expectedResult);
      expect(BcryptPass.prototype.hashPassword).toHaveBeenCalledWith(
        registerData.password,
      );
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: { ...registerData, password: 'hashPassword' },
      });
      expect(OTP.generateOTP).toHaveBeenCalled();
      expect(prismaService.auth.create).toHaveBeenCalledWith({
        data: { ...authData },
      });
      expect(mail.mailer).toHaveBeenCalledWith(
        'asimneupane11@gmail.com',
        '123456',
      );
    });
  });

  describe('verify user', () => {
    it('should verify users', async () => {
      jest
        .spyOn(prismaService.auth, 'findUnique')
        .mockResolvedValue(authDbdata);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(true);
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue(expectedResult);
      jest.spyOn(prismaService.auth, 'delete').mockResolvedValue(authDbdata);
      const result = await service.verify(authData);
      expect(result).toEqual(expectedResult);
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: authData.email },
      });
      expect(OTP.verifyOTP).toHaveBeenCalledWith('123456');
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { email: authData.email },
        data: { isEmailVerified: true, isActive: true },
      });
      expect(prismaService.auth.delete).toHaveBeenCalledWith({
        where: { email: authData.email },
      });
    });
    it('should throw an error if user not found', async () => {
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(null);
      await expect(() => service.verify(authData)).rejects.toThrow(
        new HttpException('User is not available', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: 'asimneupane11@gmail.com' },
      });
    });
    it('should throw an error if OTP is expired', async () => {
      jest
        .spyOn(prismaService.auth, 'findUnique')
        .mockResolvedValue(authDbdata);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(false);

      await expect(() => service.verify(authData)).rejects.toThrow(
        new HttpException('Token Expired', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: authData.email },
      });
    });
    it('should throw an error if token is missmatch', async () => {
      // Mock payload with valid email but invalid token (expired)

      // Mock authModel.findOne to return a user
      const fakeData = {
        email: registerData.email,
        otp: '654321',
      };
      jest
        .spyOn(prismaService.auth, 'findUnique')
        .mockResolvedValue(authDbdata);

      // Mock verifyOTP to return false, simulating token expiration
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(true);

      // Call the verify function with the payload
      await expect(() => service.verify(fakeData)).rejects.toThrow(
        new HttpException('Token mismatch', HttpStatus.BAD_REQUEST),
      );
      // Assertion: Ensure that the function throws an error with the correct message
      expect(OTP.verifyOTP).toHaveBeenCalledWith('123456');
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: authData.email },
      });
    });
  });
  describe('regenerate otp for user', () => {
    it('should regenerate a user register otp', async () => {
      jest
        .spyOn(prismaService.auth, 'findUnique')
        .mockResolvedValue(authDbdata);
      jest.spyOn(OTP, 'generateOTP').mockReturnValue('123456' as never);
      jest.spyOn(prismaService.auth, 'update').mockResolvedValue(authDbdata);
      jest.spyOn(mail, 'mailer').mockResolvedValue('email@succesjiahdabidna');
      const result = await service.regenerateToken(authData.email);
      expect(result).toEqual(true);
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: authData.email },
      });
      expect(OTP.generateOTP).toHaveBeenCalled();
      expect(prismaService.auth.update).toHaveBeenCalledWith({
        where: { email: authData.email },
        data: { otp: '123456' },
      });
      expect(mail.mailer).toHaveBeenCalledWith(
        'asimneupane11@gmail.com',
        '123456',
      );
    });
    it('should throw an error if user not found', async () => {
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        service.regenerateToken(authData.email),
      ).rejects.toThrow(
        new HttpException('User is not available', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: 'asimneupane11@gmail.com' },
      });
    });
  });
  describe('login the user', () => {
    it('should login the user and give back jwttoken', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(expectedResult);
      jest
        .spyOn(BcryptPass.prototype, 'comparePasswords')
        .mockResolvedValue(true);
      const token = 'generatedJWTtoken';
      jest.spyOn(JWT, 'generateJWT').mockReturnValue(token);
      const result = await service.login(expectedResult.email, 'Helloworld@2');
      const mockPayload = {
        id: expectedResult.id,
        email: expectedResult.email,
        roles: expectedResult?.roles || [],
      };
      expect(result).toEqual({
        user: {
          name: expectedResult.name,
          roles: expectedResult.roles,
          email: expectedResult.email,
        },
        token: token,
      });
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: expectedResult.email },
      });
      expect(BcryptPass.prototype.comparePasswords).toHaveBeenCalledWith(
        'Helloworld@2',
        'hashPassword',
      );
      expect(JWT.generateJWT).toHaveBeenCalledWith(mockPayload);
    });
    it('should thow an error if user not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        service.login('asimneupane11@gmail.com', 'Helloworld@2'),
      ).rejects.toThrow(
        new HttpException('User is not available', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: expectedResult.email },
      });
    });
    it('should thow an error if email is not verified', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({ ...expectedResult, isEmailVerified: false });
      await expect(() =>
        service.login('asimneupane11@gmail.com', 'Helloworld@2'),
      ).rejects.toThrow(
        new HttpException('Email is not verified yet', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: expectedResult.email },
      });
    });
    it('should thow an error if user is not active', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue({ ...expectedResult, isActive: false });
      await expect(() =>
        service.login('asimneupane11@gmail.com', 'Helloworld@2'),
      ).rejects.toThrow(
        new HttpException(
          'User is not active . Please contact admin',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: expectedResult.email },
      });
    });
    it('should thow an error if user or password is incorrect', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(expectedResult);
      jest
        .spyOn(BcryptPass.prototype, 'comparePasswords')
        .mockResolvedValue(false);
      await expect(() =>
        service.login('asimneupane11@gmail.com', 'Helloworld@2'),
      ).rejects.toThrow(
        new HttpException(
          'User or password is incorrect',
          HttpStatus.BAD_REQUEST,
        ),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: expectedResult.email },
      });
      expect(BcryptPass.prototype.comparePasswords).toHaveBeenCalledWith(
        'Helloworld@2',
        'hashPassword',
      );
    });
  });
  describe('generateFPToken for user', () => {
    it('should generateFPToken for user', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(expectedResult);
      jest.spyOn(OTP, 'generateOTP').mockReturnValue('123456');
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.auth, 'create').mockResolvedValue(authDbdata);
      jest.spyOn(mail, 'mailer').mockResolvedValue('email@succesjiahdabidna');

      const result = await service.generateFPToken('asimneupane11@gmail.com');
      expect(result).toEqual(true);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: expectedResult.email,
          isActive: true,
          isArchive: false,
        },
      });
      expect(OTP.generateOTP).toHaveBeenCalled();
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: expectedResult.email },
      });
      expect(prismaService.auth.create).toHaveBeenCalledWith({
        data: { email: 'asimneupane11@gmail.com', otp: '123456' },
      });
      expect(mail.mailer).toHaveBeenCalledWith(authData.email, authData.otp);
    });
    it('should generateFPToken for user if its already save in auths', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValue(expectedResult);
      jest.spyOn(OTP, 'generateOTP').mockReturnValue('123456');
      jest
        .spyOn(prismaService.auth, 'findUnique')
        .mockResolvedValue(authDbdata);
      jest.spyOn(prismaService.auth, 'update').mockResolvedValue(authDbdata);
      jest.spyOn(mail, 'mailer').mockResolvedValue('email@succesjiahdabidna');

      const result = await service.generateFPToken('asimneupane11@gmail.com');
      expect(result).toEqual(true);

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: expectedResult.email,
          isActive: true,
          isArchive: false,
        },
      });
      expect(OTP.generateOTP).toHaveBeenCalled();
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: expectedResult.email },
      });
      expect(prismaService.auth.update).toHaveBeenCalledWith({
        where: { email: authData.email },
        data: { otp: '123456' },
      });
      expect(mail.mailer).toHaveBeenCalledWith(authData.email, authData.otp);
    });
    it('should throw an error if user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      await expect(() =>
        service.generateFPToken('asimneupane11@gmail.com'),
      ).rejects.toThrow(
        new HttpException('User is not available', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: {
          email: expectedResult.email,
          isActive: true,
          isArchive: false,
        },
      });
    });
  });

  describe('forget password', () => {
    it('should forget password', async () => {
      jest
        .spyOn(prismaService.auth, 'findUnique')
        .mockResolvedValue(authDbdata);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(true);
      jest
        .spyOn(BcryptPass.prototype, 'hashPassword')
        .mockResolvedValue('hashPassword');
      jest
        .spyOn(prismaService.user, 'update')
        .mockResolvedValue(expectedResult);
      jest.spyOn(prismaService.auth, 'delete').mockResolvedValue(authDbdata);
      const result = await service.forgetPassowrd(
        'asimneupane11@gmail.com',
        '123456',
        'Helloworld@4',
      );
      expect(result).toEqual(true);
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: authData.email },
      });
      expect(OTP.verifyOTP).toHaveBeenCalledWith('123456');
      expect(BcryptPass.prototype.hashPassword).toHaveBeenCalledWith(
        'Helloworld@4',
      );
      expect(prismaService.user.update).toHaveBeenCalledWith({
        where: { email: expectedResult.email },
        data: {
          password: 'hashPassword',
        },
      });
      expect(prismaService.auth.delete).toHaveBeenCalledWith({
        where: { email: authDbdata.email },
      });
    });
    it('should throw an error if user not found', async () => {
      jest.spyOn(prismaService.auth, 'findUnique').mockResolvedValue(null);

      await expect(() =>
        service.forgetPassowrd(
          'asimneupane11@gmail.com',
          '123456',
          'Helloworld@4',
        ),
      ).rejects.toThrow(
        new HttpException('user not found', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: authData.email },
      });
    });
    it('should throw an error if OTP expired', async () => {
      jest
        .spyOn(prismaService.auth, 'findUnique')
        .mockResolvedValue(authDbdata);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(false);

      await expect(() =>
        service.forgetPassowrd(
          'asimneupane11@gmail.com',
          '123456',
          'Helloworld@4',
        ),
      ).rejects.toThrow(
        new HttpException('Token expired', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: authData.email },
      });
      expect(OTP.verifyOTP).toHaveBeenCalledWith('123456');
    });
    it('should throw an error if OTP mismatch', async () => {
      jest
        .spyOn(prismaService.auth, 'findUnique')
        .mockResolvedValue(authDbdata);
      jest.spyOn(OTP, 'verifyOTP').mockResolvedValue(true);

      await expect(() =>
        service.forgetPassowrd(
          'asimneupane11@gmail.com',
          '654321',
          'Helloworld@4',
        ),
      ).rejects.toThrow(
        new HttpException('Token mismatch', HttpStatus.BAD_REQUEST),
      );
      expect(prismaService.auth.findUnique).toHaveBeenCalledWith({
        where: { email: authData.email },
      });
      expect(OTP.verifyOTP).toHaveBeenCalledWith('654321');
    });
  });
});
