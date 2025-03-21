import { Controller, Get, Post, Body, Patch, Param, Delete, NotFoundException, Query } from '@nestjs/common';
import { SaveJobService } from './save-job.service';
import { CreateSaveJobDto } from './dto/create-save-job.dto';
import { UpdateSaveJobDto } from './dto/update-save-job.dto';
import { User } from 'src/common/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('save-job')
export class SaveJobController {
  constructor(private readonly saveJobService: SaveJobService) { }

  @Post()
  create(@Body() createSaveJobDto: CreateSaveJobDto, @User() user: IUser) {
    const userId = user._id
    return this.saveJobService.createSaveJob({ ...createSaveJobDto, userId });
  }

  @Get()
  findAll(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string,
    @User() user: IUser
  ) {
    const userId = user._id
    return this.saveJobService.getAllSaveJob(+currentPage, +limit, qr, userId);
  }

  @Get('check-saved/:jobId')
  async checkIfSaved(@Param('jobId') jobId: string, @User() user: IUser) {
    const userId = user._id;
    const isSaved = await this.saveJobService.checkIfJobIsSaved(jobId, userId);
    return { isSaved };
  }

  @Delete('clearAll')
  removeAll(@User() user: IUser) {
    const userId = user._id
    return this.saveJobService.removeAllSaveJob(userId)
  }

  @Delete(':id')
  async remove(@Param('id') jobId: string, @User() user: IUser) {
    const userId = user._id
    const deletedJob = await this.saveJobService.removeSavedJob(jobId, userId);
    if (!deletedJob) {
      throw new NotFoundException('Saved job not found or not owned by the user');
    }
    return deletedJob;
  }

}
