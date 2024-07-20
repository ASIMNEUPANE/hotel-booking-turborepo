import { PartialType, PickType } from '@nestjs/swagger';
import { CreateUserDto } from './CreateUser.dto';
import { IsBoolean, IsString, IsStrongPassword } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class UpdateByIdDto extends PickType(CreateUserDto, ['name'] as const) {
  images?: string;
}
export class ResetPasswordDto extends PickType(CreateUserDto, [
  'password',
] as const) {}
export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Enter oldPassword of the user',
    example: 'Hellworld@2',
  })
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  @ApiProperty({
    description: 'Enter newPassword of the user',
    example: 'ExamplePass@2',
  })
  newPassword: string;
}
export class BlockUserDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Enter payload to block user',
    example: 'isActive:true',
  })
  isActive: boolean;
}
export class DeleteUserDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Enter payload to delete user',
    example: 'isArchive:true',
  })
  isArchive: boolean;
}
