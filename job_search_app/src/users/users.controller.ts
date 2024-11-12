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
  create(
    @Body() createUserDto: CreateUserDto,
  ) {
    return this.usersService.registerUser(createUserDto);
  }

  @Public()
  @Post('verify')
  async verify(@Body() createUserDto: CreateUserDto, @Query('code') code: string) {
    return this.usersService.verifyUser(code, createUserDto);
  }

  @Get('/allUser')
  findAllUser(
    @Query("page") currentPage: string,
    @Query("pageSize") limit: string,
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
