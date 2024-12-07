import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Public, User } from 'src/common/decorator/customize';
import { IUser } from 'src/users/users.interface';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';

@Controller('companies')
export class CompaniesController {
  constructor(
    private readonly companiesService: CompaniesService,
    private readonly filesService: FilesService
  ) { }

  @Post()
  @UseInterceptors(FileInterceptor('avatar'))
  async create(
    @Body() createCompanyDto: CreateCompanyDto,
    @User() user: IUser,
    @UploadedFile() file?: Express.Multer.File) {
    const avatar = file ? await this.filesService.uploadFile(file) : undefined;
    return this.companiesService.createCompany(createCompanyDto, user, avatar);
  }

  @Get('user')
  async getCompanyByUserId(@User() user: IUser) {
    const company = await this.companiesService.getCompanyByUserId(user);
    return company;
  }

  @Get()
  @Public()
  findAll(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qs: string
  ) {
    return this.companiesService.getAllCompany(+currentPage, +limit, qs);
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.companiesService.getCompanyDetail(id);
  }


  @Patch(':id')
  @UseInterceptors(FileInterceptor('avatar'))
  async update(
    @Body() updateCompanyDto: UpdateCompanyDto,
    @Param('id') id: string,
    @User() user: IUser,
    @UploadedFile() file?: Express.Multer.File,) {
    const avatar = file ? await this.filesService.uploadFile(file) : undefined;
    console.log(avatar)
    return this.companiesService.updateCompany(id, updateCompanyDto, user, avatar);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.companiesService.removeCompany(id, user)
  };





}
