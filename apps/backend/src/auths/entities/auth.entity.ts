import { ApiProperty } from '@nestjs/swagger';
import { Roles, User } from '@prisma/client';
import { Exclude } from 'class-transformer';

export class AuthEntity implements User {
  constructor(partial: Partial<AuthEntity>) {
    Object.assign(this, partial);
  }

  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @Exclude()
  password: string;

  @ApiProperty()
  roles: Roles[];

  @ApiProperty()
  images: string;

  @ApiProperty()
  created_by: string;

  @ApiProperty()
  updated_by: string;

  // Additional properties
  @ApiProperty()
  isEmailVerified: boolean;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  isArchive: boolean;
}
