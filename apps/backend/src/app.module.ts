import { Module } from '@nestjs/common';
import { AuthsModule } from './auths/auths.module';
import { UserModule } from './users/user.module';
import { PrismaService } from './prisma/prisma.service';
import { RoleGuard } from './auths/guards/role.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  imports: [AuthsModule, UserModule],
  controllers: [],
  providers: [{ provide: APP_GUARD, useClass: RoleGuard }, PrismaService],
})
export class AppModule {}
