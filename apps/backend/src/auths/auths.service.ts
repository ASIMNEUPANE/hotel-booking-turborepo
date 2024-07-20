import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { LogInReturnDto } from './dto/create-auth.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { BcryptPass } from '../utils/Bcrypt';
import { generateOTP, verifyOTP } from '../utils/otp';
import { mailer } from '../utils/mailer';
import { generateJWT } from '../utils/jwt';
@Injectable()
export class AuthsService {
  constructor(
    private prisma: PrismaService,
    private bcrypt: BcryptPass,
  ) {}

  async register(createAuthDto: Prisma.UserCreateInput) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isActive, isEmailVerified, roles, password, ...rest } =
        createAuthDto as {
          password: string;
          [key: string]: any;
        };

      const auth = await this.prisma.user.findUnique({
        where: { email: rest.email },
      });

      if (auth)
        throw new HttpException(
          'User is already register',
          HttpStatus.BAD_REQUEST,
        );
      const name = await this.prisma.user.findUnique({
        where: { name: rest.name },
      });
      if (name)
        throw new HttpException(
          'This username is already in use',
          HttpStatus.BAD_REQUEST,
        );
      rest.password = await this.bcrypt.hashPassword(password);
      const user = await this.prisma.user.create({
        data: rest as Prisma.UserUncheckedCreateInput,
      });
      console.log(user);
      const token = generateOTP();
      const authUSer = { email: user.email, otp: token };
      const x = await this.prisma.auth.create({ data: authUSer });
      console.log(x);
      const mail = await mailer(user?.email, token);
      console.log(mail);
      return user;
    } catch (e) {
      console.log(e);
      throw new HttpException(`${e}`, HttpStatus.SERVICE_UNAVAILABLE);
    }
  }

  async verify(payload: Prisma.AuthCreateInput) {
    const { email, otp } = payload;
    const auth = await this.prisma.auth.findUnique({ where: { email } });
    if (!auth)
      throw new HttpException('User is not available', HttpStatus.BAD_REQUEST);
    const isValidToken = await verifyOTP(otp);
    if (!isValidToken)
      throw new HttpException('Token Expired', HttpStatus.BAD_REQUEST);
    const emailValid = auth?.otp === otp;
    if (!emailValid)
      throw new HttpException('Token mismatch', HttpStatus.BAD_REQUEST);

    const user = await this.prisma.user.update({
      where: { email },
      data: { isEmailVerified: true, isActive: true },
    });

    await this.prisma.auth.delete({ where: { email } });
    return user;
  }

  async regenerateToken(email: string): Promise<boolean> {
    const auth = await this.prisma.auth.findUnique({ where: { email: email } });
    if (!auth)
      throw new HttpException('User is not available', HttpStatus.BAD_REQUEST);
    const newToken = generateOTP();
    await this.prisma.auth.update({
      where: { email },
      data: { otp: newToken },
    });
    await mailer(email, newToken);
    return true;
  }

  async login(email: string, password: string): Promise<LogInReturnDto> {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new HttpException('User is not available', HttpStatus.BAD_REQUEST);
    if (!user?.isEmailVerified)
      throw new HttpException(
        'Email is not verified yet',
        HttpStatus.BAD_REQUEST,
      );
    if (!user?.isActive)
      throw new HttpException(
        'User is not active . Please contact admin',
        HttpStatus.BAD_REQUEST,
      );
    const isValidPw = await this.bcrypt.comparePasswords(
      password,
      user?.password,
    );
    if (!isValidPw)
      throw new HttpException(
        'User or password is incorrect',
        HttpStatus.BAD_REQUEST,
      );
    const payload = {
      id: user?.id,
      email: user?.email,
      roles: user?.roles,
    };

    const token = generateJWT(payload);
    console.log(token);
    return {
      user: { name: user.name, roles: user.roles, email: user.email },
      token,
    };
  }

  async generateFPToken(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
        isActive: true,
        isArchive: false,
      },
    });

    if (!user)
      throw new HttpException('User is not available', HttpStatus.BAD_REQUEST);

    const otp = generateOTP();
    const auth = await this.prisma.auth.findUnique({ where: { email } });

    if (auth) {
      // If the auth entry exists, update the token
      await this.prisma.auth.update({
        where: { email },
        data: { otp },
      });
    } else {
      // If the auth entry doesn't exist, create a new one
      await this.prisma.auth.create({ data: { email, otp } });
    }

    await mailer(email, otp);
    return true;
  }
  async forgetPassowrd(
    email: string,
    otp: string,
    password: string,
  ): Promise<boolean> {
    const auth = await this.prisma.auth.findUnique({ where: { email } });
    if (!auth)
      throw new HttpException('user not found', HttpStatus.BAD_REQUEST);
    const isValidToken = await verifyOTP(otp);
    if (!isValidToken)
      throw new HttpException('Token expired', HttpStatus.BAD_REQUEST);
    const emailValid = auth?.otp === otp;
    if (!emailValid)
      throw new HttpException('Token mismatch', HttpStatus.BAD_REQUEST);
    const hashPassword = await this.bcrypt.hashPassword(password);
    await this.prisma.user.update({
      where: { email },
      data: {
        password: hashPassword,
      },
    });
    await this.prisma.auth.delete({ where: { email } });
    return true;
  }
}
