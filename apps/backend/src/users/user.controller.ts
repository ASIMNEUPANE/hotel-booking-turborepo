import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Logger,
  Put,
  UseGuards,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, GetUserDto } from './dtos/CreateUser.dto';
import {
  UpdateByIdDto,
  ChangePasswordDto,
  ResetPasswordDto,
  BlockUserDto,
  DeleteUserDto,
} from './dtos/update-user.dto';
import {
  ApiTags,
  ApiBearerAuth,
  ApiResponse,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { Roles } from '../common/decorators/roles.decorator';
import { RoleGuard } from '../auths/guards/role.guard';

@ApiBearerAuth('access-token')
@UseGuards(RoleGuard)
@Controller('users')
@ApiTags('Users')
export class UserController {
  private logger = new Logger('User controller');
  constructor(private userService: UserService) {}

  // Creating user
  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Create new user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.userService.createUser(createUserDto);
  }

  // Get all user
  @Get()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'List all user' })
  @ApiQuery({ name: 'limit', required: false, type: String })
  @ApiQuery({ name: 'page', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getUsers(
    @Query('limit', new DefaultValuePipe(4), ParseIntPipe) limit: number = 4,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Body() getUserDto: GetUserDto,
  ) {
    const { roles } = getUserDto;
    const search = { roles };
    return this.userService.getUser(limit, page, search);
  }

  // Get user by id
  @Get(':id')
  @ApiOperation({ summary: 'Get an user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  getUserById(@Param('id') id: string) {
    return this.userService.getById(id);
  }

  // Update user by id
  @Put(':id')
  @ApiOperation({ summary: 'Update  name and images of the user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  updateUserById(
    @Param('id', ParseIntPipe) id: string,
    @Body() updateByIdDto: UpdateByIdDto,
  ) {
    return this.userService.updateById(id, updateByIdDto);
  }

  // change password by id
  @Put('change-password/:id')
  @ApiOperation({ summary: 'Update an user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  changePassword(
    @Param('id', ParseIntPipe) id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userService.changePassword(
      id,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
    );
  }

  //Reset password by id
  @Put('reset-password/:id')
  @ApiOperation({ summary: 'Reset user Password' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  resetPassword(
    @Param('id', ParseIntPipe) id: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ) {
    return this.userService.resetPassword(id, resetPasswordDto);
  }

  // Block user by id
  @Put('block/:id')
  @ApiOperation({ summary: 'Block an user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  blockUser(
    @Param('id', ParseIntPipe) id: string,
    @Body() blockUserDto: BlockUserDto,
  ) {
    return this.userService.block(id, blockUserDto);
  }

  // Delete user by id
  @Put('archive/:id')
  @ApiOperation({ summary: 'Delete an user' })
  @ApiResponse({
    status: 200,
    description: 'The found record',
    type: [UserEntity],
  })
  @ApiResponse({ status: 403, description: 'Forbidden.' })
  deleteUser(
    @Param('id', ParseIntPipe) id: string,
    @Body() deleteUserDto: DeleteUserDto,
  ) {
    return this.userService.archive(id, deleteUserDto);
  }
}
