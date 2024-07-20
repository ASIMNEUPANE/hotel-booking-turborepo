import {
  IsNotEmpty,
  IsString,
  IsEmail,
  IsOptional,
  IsStrongPassword,
} from 'class-validator';
// import { Roles } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Full Name of the user',
    example: 'John Doe',
  })
  name: string;

  @IsEmail()
  @ApiProperty({
    description: 'Email of the user',
    example: 'john@doe.com',
  })
  email: string;

  @IsString()
  @IsStrongPassword()
  @ApiProperty({
    description: 'Password of the user',
    example: 'Hellworld@2',
  })
  password: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Images of the user',
    example: 'Hellworld@2',
  })
  images?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'Array of roles associated with the user',
    example: '["USERS"]',
  })
  roles?: string[];
}

export class GetUserDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'title of the blog',
    example: 'Nepal the great',
  })
  roles?: string;
}
