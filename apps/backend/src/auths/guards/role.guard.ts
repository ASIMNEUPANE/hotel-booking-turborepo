import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../users/entities/role.enum';
import { verifyJWT } from '../../utils/jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { HttpException, HttpStatus } from '@nestjs/common';
@Injectable()
export class RoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const roles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!roles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = request?.headers?.authorization;
    if (!token)
      throw new HttpException('Access token required', HttpStatus.BAD_REQUEST);
    const accessToken = token.split('Bearer ')[1];
    const { data } = verifyJWT(accessToken) as any;
    if (!data) throw new Error('Data is not available');
    const { email } = data;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user)
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    (request as any).currentUser = user?.id;
    (request as any).currentUserName = user?.name;
    (request as any).currentRoles = user?.roles;
    const isValidRole = roles.some((role) => user.roles.includes(role as any));
    if (!isValidRole)
      throw new HttpException('User unauthorized', HttpStatus.BAD_REQUEST);

    return isValidRole;
  }
}
