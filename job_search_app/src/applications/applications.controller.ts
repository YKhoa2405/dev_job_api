import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UploadedFile, ParseFilePipeBuilder, HttpStatus, BadRequestException, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Public, User } from 'src/common/decorator/customize';
import { FileInterceptor } from '@nestjs/platform-express';
import { FilesService } from 'src/files/files.service';
import { IUser } from 'src/users/users.interface';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
    private readonly filesService: FilesService

  ) { }

  @Post('apply')
  @UseInterceptors(FileInterceptor('file'))
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @UploadedFile() file: Express.Multer.File,
    @User() user: IUser
  ) {
    const cvUrl = await this.filesService.uploadFile(file)
    return this.applicationsService.createApplyJob(createApplicationDto, user, cvUrl);
  }

  @Get()
  findAll(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string,
  ) {
    return this.applicationsService.getAllApplication(+currentPage, +limit, qr);
  }

  @Get('byCompany/:companyId')
  async findApplicationByCompany(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string,
    @Param('companyId') companyId: string) {
    return await this.applicationsService.getApplicationByCompany(+currentPage, +limit, qr, companyId);
  }

  @Get('byJob/:jobId')
  async findApplicationByJob(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string,
    @Param('jobId') jobId: string) {
    return await this.applicationsService.getApplicationByJob(+currentPage, +limit, qr, jobId);
  }

  


  @Post('byUser')
  async findApplicationByUser(@User() user: IUser) {
    return await this.applicationsService.getApplicationByUser(user);
  }


  @Patch(':id')
  update(@Param('id') id: string, @Body('status') status: string, @User() user: IUser) {
    return this.applicationsService.updateApplication(id, status, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.applicationsService.removeApplication(id);
  }
}
