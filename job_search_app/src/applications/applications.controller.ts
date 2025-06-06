import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApplicationsService } from './applications.service';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { Public, User } from 'src/common/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('applications')
export class ApplicationsController {
  constructor(
    private readonly applicationsService: ApplicationsService,
  ) { }

  @Post('apply')
  async create(
    @Body() createApplicationDto: CreateApplicationDto,
    @User() user: IUser
  ) {
    return this.applicationsService.createApplyJob(createApplicationDto, user);
  }

  @Get()
  findAll(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string,
  ) {
    return this.applicationsService.getAllApplication(+currentPage, +limit, qr);
  }

  @Get('candidate')
  async findApplicationByUser(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string,
    @User() user: IUser) {
    return await this.applicationsService.getApplicationByCandidate(+currentPage, +limit, qr, user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.applicationsService.findOne(id);
  }


  @Get('byJob/:jobId')
  async findApplicationByJob(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string,
    @Param('jobId') jobId: string) {
    return await this.applicationsService.getApplicationByJob(+currentPage, +limit, qr, jobId);
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
