import { ConflictException, Injectable } from '@nestjs/common';
import { CreateSaveJobDto } from './dto/create-save-job.dto';
import { UpdateSaveJobDto } from './dto/update-save-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { SaveJob, SaveJobDocument } from './schemas/save-job.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { IUser } from 'src/users/users.interface';

@Injectable()
export class SaveJobService {
  constructor(@InjectModel(SaveJob.name) private saveJobModel: Model<SaveJobDocument>) { }


  async createSaveJob(createSaveJobDto: CreateSaveJobDto) {
    const { userId, jobId } = createSaveJobDto;

    const existing = await this.saveJobModel.findOne({ userId, jobId });
    if (existing) {
      throw new ConflictException('Job is already saved');
    }

    const saveJob = new this.saveJobModel(createSaveJobDto);
    return saveJob.save();
  }

  async checkIfJobIsSaved(jobId: string, userId: string): Promise<boolean> {
    const savedJob = await this.saveJobModel.findOne({
      jobId,
      userId,
      isActive: true, // Chỉ xét công việc đang được lưu
    });
    return savedJob !== null; // Trả về true nếu đã lưu, false nếu chưa
  }

  async getAllSaveJob(currentPage: number, limit: number, qr: string, userId: string) {
    const { filter = {}, sort, population, projection } = aqp(qr);
    delete filter.page;
    delete filter.pageSize;

    filter.userId = userId;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10

    const totalItems = await this.saveJobModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.saveJobModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
      .populate({
        path: 'jobId',
        select: 'name companyId salary level skills endDate',
        populate: {
          path: 'companyId',
          select: 'name avatar',
        },
      })
      .select('jobId isFavorite')
      .exec();

    return {
      meta: {
        currentPage,
        pageSize: defaultLimit,
        totalItems,
        totalPages,
      },
      result,
    };
  }

  async removeSavedJob(id: string, userId: string) {
    const deletedJob = await this.saveJobModel.findOneAndDelete({ _id: id, userId });
    return deletedJob;
  }

  async removeAllSaveJob(userId: string) {
    const result = await this.saveJobModel.deleteMany({ userId });
    return result.deletedCount || 0;

  }

}
