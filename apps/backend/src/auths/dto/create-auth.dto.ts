import {
  IsString,
  IsEmail,
  IsStrongPassword,
  IsNotEmpty,
  IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateAuthDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'zFull Name of the user',
    example: 'John Doe',
  })
  name: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email of the user',
    example: 'john@doe.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  @ApiProperty({
    description: 'Password of the user',
    example: 'Hellworld@2',
  })
  password: string;

  @IsOptional()
  images?: string;
}

export class VerifyDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email of the user',
    example: 'john@doe.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Otp of the user',
    example: '134684',
  })
  otp: string;
}

export class LoginDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email of the user',
    example: 'john@doe.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'Password of the user',
    example: 'Hellworld@2',
  })
  password: string;
}
export class GenerateFPTokenDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email of the user',
    example: 'john@doe.com',
  })
  email: string;
}
export class ForgetPassowrdDto {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email of the user',
    example: 'john@doe.com',
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: 'Otp of the forgetPassword',
    example: 'Hellworld@2',
  })
  otp: string;

  @IsString()
  @IsStrongPassword()
  @ApiProperty({
    description: 'Password of the user',
    example: 'Hellworld@2',
  })
  password: string;
}

export class LogInReturnDto {
  @ApiProperty()
  user: {
    name: string;
    roles: string[];
    email: string;
  };

  @ApiProperty()
  token: string;
}
export class ReturnTrueDto {
  @ApiProperty()
  success: boolean;
}
