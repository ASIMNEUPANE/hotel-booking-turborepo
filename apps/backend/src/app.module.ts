import { Module } from '@nestjs/common';
import { AuthsModule } from './auths/auths.module';
import { UserModule } from './users/user.module';
import { PrismaService } from './prisma/prisma.service';
import { RoleGuard } from './auths/guards/role.guard';
import { APP_GUARD } from '@nestjs/core';
import { HotelModule } from './hotel/hotel.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppService } from './app.service';

@Module({
  imports: [AuthsModule, UserModule, HotelModule, PrismaModule],
  controllers: [],
  providers: [
    { provide: APP_GUARD, useClass: RoleGuard },
    PrismaService,
    AppService,
  ],
})
export class AppModule {}
