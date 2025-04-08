import { IUser } from './../users/users.interface';
import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { UpdateReportDto } from './dto/update-report.dto';
import { Report } from './schemas/report.schema';
import { User } from 'src/common/decorator/customize';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) { }

  @Post()
  async create(
    @Body() createReportDto: CreateReportDto,
    @User() user: IUser
  ): Promise<Report> {
    return this.reportsService.create(createReportDto, user);
  }


  @Get()
  async findAll(): Promise<Report[]> {
    return this.reportsService.findAll();
  }

  @Get('job/:jobId')
  async findByJobId(
    @Param('jobId') jobId: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query() qr: string,
  ): Promise<{ meta: any; result: Report[] }> {
    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 10;
    return this.reportsService.getReportByJob(jobId, pageNum, limitNum, qr);
  }

  @Patch(':id')
  updateCategory(
    @Param('id') id: string,
    @Body('category') category: string,
  ) {
    return this.reportsService.update(id, category);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.reportsService.remove(+id);
  }
}
