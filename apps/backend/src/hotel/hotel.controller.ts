import {
  Controller,
  Get,
  Post,
  Body,
  // Patch,
  // Param,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  FileTypeValidator,
  MaxFileSizeValidator,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  // Put,
} from '@nestjs/common';
import { HotelService } from './hotel.service';
import { CreateHotelDto } from './dto/create-hotel.dto';
import {
  // DeleteHotelDto,
  GetHotelDto,
  // UpdateHotelDto,
} from './dto/update-hotel.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import {
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@Controller('hotel')
@ApiTags('Hotel')
export class HotelController {
  constructor(private readonly hotelService: HotelService) {}

  @Post('/check')
  check(@Body() createHotelDto: CreateHotelDto) {
    console.log(createHotelDto);
    return 'hello';
  }

  @Post('create')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('img', {
      storage: diskStorage({
        destination: './public/hotel',
        filename: (req, file, cb) => {
          // Generating a unique filename
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = file.originalname.split('.').pop();
          cb(null, `${uniqueSuffix}.${extension}`);
        },
      }),
    }),
  )
  create(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: 'image/jpeg' }),
          new MaxFileSizeValidator({ maxSize: 1000000 }),
        ],
        fileIsRequired: true,
      }),
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    ) //@ts-expect-error
    file: Express.Multer.File,
    @Body() createHotelDto: CreateHotelDto,
  ) {
    console.log(createHotelDto);
    if (file) {
      const uniqueSuffix = Date.now() + '.' + file.originalname.split('.')[1];
      console.log(uniqueSuffix);
      createHotelDto.img = uniqueSuffix;
    }
    console.log(createHotelDto);
    return this.hotelService.create(createHotelDto);
  }

  @Get()
  @ApiOperation({ summary: 'List all Hotels' })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'The found record',
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getUsers(
    @Query('limit', new DefaultValuePipe(4), ParseIntPipe) limit: number = 4,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Body() getHotelDto: GetHotelDto,
  ) {
    const { name } = getHotelDto;
    const search = { name };
    return this.hotelService.findAll(limit, page, search);
  }

  @Get('/gets')
  get() {
    return 'hello world';
  }

  // @Get(':id')
  // @ApiOperation({ summary: 'Get an user' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The found record',
  // })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // getUserById(@Param('id') id: string) {
  //   return this.hotelService.findOne(id);
  // }

  // @Put(':id')
  // @UseInterceptors(
  //   FileInterceptor('img', {
  //     storage: diskStorage({
  //       destination: './public/hotel',
  //       filename: (req, file, cb) => {
  //         // Generating a unique filename
  //         const uniqueSuffix =
  //           Date.now() + '-' + Math.round(Math.random() * 1e9);
  //         const extension = file.originalname.split('.').pop();
  //         cb(null, `${uniqueSuffix}.${extension}`);
  //       },
  //     }),
  //   }),
  // )
  // update(
  //   @Param('id') id: string,
  //   @UploadedFile(
  //     new ParseFilePipe({
  //       validators: [
  //         new FileTypeValidator({ fileType: 'image/jpeg' }),
  //         new MaxFileSizeValidator({ maxSize: 100000 }),
  //       ],
  //       fileIsRequired: true,
  //     }),
  //     // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //   ) //@ts-expect-error
  //   file: Express.Multer.File,
  //   @Body() updateHotelDto: UpdateHotelDto,
  // ) {
  //   if (file) {
  //     const uniqueSuffix = Date.now() + '.' + file.originalname.split('.')[1];

  //     updateHotelDto.img = uniqueSuffix;
  //   }
  //   return this.hotelService.update(id, updateHotelDto);
  // }

  // @Patch('archive/:id')
  // @ApiOperation({ summary: 'Delete an user' })
  // @ApiResponse({
  //   status: 200,
  //   description: 'The found record',
  // })
  // @ApiResponse({ status: 403, description: 'Forbidden.' })
  // deleteUser(
  //   @Param('id', ParseIntPipe) id: string,
  //   @Body() deleteHotelDto: DeleteHotelDto,
  // ) {
  //   return this.hotelService.archive(id, deleteHotelDto);
  // }
}
