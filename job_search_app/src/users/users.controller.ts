import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public, User } from 'src/common/decorator/customize';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';
import { IUser } from './users.interface';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly filesService: FilesService) { }

  @Post('register')
  @Public()
  register(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.registerUser(createUserDto);
  }

  @Post()
  @Public()
  create(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.createUser(createUserDto);
  }

  @Public()
  @Post('verify')
  async verify(
    @Body() createUserDto: CreateUserDto,
    @Query('roleName') roleName: string,
    @Query('code') code: string) {
    return this.usersService.verifyUser(code, createUserDto, roleName);
  }

  @Public()
  @Post('sendCode')
  async sendCode(@Body() createUserDto: CreateUserDto) {
    await this.usersService.sendForgotPassCode(createUserDto);
    return { message: 'Mã xác minh đã được gửi đến email của bạn.' };
  }

  @Public()
  @Post('changePassword')
  async changePassword(@Body() body: { email: string, code: string, newPassword: string }) {
    return this.usersService.changePasswordWithCode(body.email, body.newPassword, body.code);
  }



  @Get('/allUser')
  findAllUser(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string,
  ) {
    return this.usersService.getAllUser(+currentPage, +limit, qr);
  }

  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Param('id') id: string, // Retrieve `id` from path parameters
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const avatar = file ? await this.filesService.uploadFile(file) : undefined;
    return this.usersService.updateUser(id, updateUserDto, avatar);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.removeUser(id, user);
  }

  @Get(':id')
  findUserDetail(@Param('id') id: string) {
    return this.usersService.getUserDetail(id);
  }


}
