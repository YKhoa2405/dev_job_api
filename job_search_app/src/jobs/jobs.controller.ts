import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

import { IUser } from 'src/users/users.interface';
import { User } from 'src/common/decorator/customize';
import { JobLevel, JobType } from './schemas/job.schema';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) { }

  @Post()
  create(@Body() createJobDto: CreateJobDto, @User() user: IUser) {
    return this.jobsService.createJob(createJobDto, user);
  }

  @Get('search') // Đường dẫn riêng cho tìm kiếm
  async search(
    @Query('name') name?: string,
    @Query('level') level?: JobLevel,
    @Query('city') city?: string,
    @Query('jobType') jobType?: JobType
  ) {
    return this.jobsService.getJobSearch(name, level, city, jobType);
  }

  @Get('nearby')
  async findJobNearby(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radius') radius: string,
  ) {
    return this.jobsService.getJobNearby(+latitude, +longitude, +radius);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJobDto: UpdateJobDto, @User() user: IUser) {
    return this.jobsService.updateJob(id, updateJobDto, user);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.jobsService.removeJob(id);
  }

  @Get(':companyId/jobs')
  findJobByCompany(
    @Param('companyId') companyId: string,
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string,
  ) {
    return this.jobsService.getJobByCompany(companyId, +currentPage, +limit, qr);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.jobsService.getJobDetail(id);
  }

}
