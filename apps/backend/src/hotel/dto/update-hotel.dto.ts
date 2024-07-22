import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateHotelDto } from './create-hotel.dto';
import { PickType } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty } from 'class-validator';

export class UpdateHotelDto extends PartialType(CreateHotelDto) {}

export class GetHotelDto extends PickType(CreateHotelDto, ['name'] as const) {}

export class DeleteHotelDto {
  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'delete hotel',
  })
  isArchive: boolean;
}
