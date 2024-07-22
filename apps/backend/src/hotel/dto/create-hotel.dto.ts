import { ApiProperty } from '@nestjs/swagger';
import { File } from 'buffer';
// import { RoomType } from '@prisma/client';
// import { Type } from 'class-transformer';
import {
  // IsArray,
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  // ValidateNested,
} from 'class-validator';

// class CreateRoomDto {
//   @IsString({ each: true })
//   img: string[];

//   @IsString()
//   roomType: string; // Use RoomType enum if needed

//   @IsBoolean()
//   isBooked: boolean;
// }

// class CreateReviewDto {
//   @IsString()
//   comment?: string;

//   @IsNumber()
//   star: number;
// }

export class CreateHotelDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'name of the hotel',
    example: 'om hotel',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'address of the hotel',
    example: 'Tinkune,ktm',
  })
  address: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'delete tje hotel',
    example: 'Tinkune,ktm',
  })
  isArchive: boolean;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'number of the hotel',
    example: 9847056528,
  })
  contact: number;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email of the hotel',
    example: 'john@doe.com',
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: 'Email of the hotel',
    type: File,
    properties: {
      img: {
        type: 'string',
        format: 'binary',
      },
    },
  })
  @IsOptional()
  img: string;

  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateRoomDto)
  // rooms: CreateRoomDto[];
  // @IsOptional()
  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => CreateReviewDto)
  // reviews: CreateReviewDto[];
}
