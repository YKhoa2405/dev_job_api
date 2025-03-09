import { Injectable, Request } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument, JobLevel, JobType } from './schemas/job.schema';
import { User } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { Skill } from 'src/skills/schemas/skill.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Skill.name) private skillModel: Model<Skill>,
  ) { }

  async createJob(createJobDto: CreateJobDto, user: IUser) {
    let newJob = this.jobModel.create({
      ...createJobDto,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });

    const skillNames = createJobDto.skills; // Mảng tên kỹ năng từ frontend

    // Step 1: Cập nhật popularity dựa trên name
    await this.skillModel.updateMany(
      { name: { $in: skillNames } }, // Tìm các kỹ năng theo name
      { $inc: { popularity: 1 } }   // Tăng popularity
    );
    return newJob;
  }


  getJobDetail(id: string) {
    return this.jobModel
      .findOne({ _id: id })
      .populate('companyId', 'name avatar')
      .exec();
  }


  updateJob(id: string, updateJobDto: UpdateJobDto, user: IUser) {
    return this.jobModel.updateOne({ _id: id },
      {
        ...updateJobDto,
        updateBy: {
          _id: user._id,
          email: user.email
        }
      }
    );
  }

  removeJob(id: string) {
    return this.jobModel.findByIdAndDelete(id).exec();
  }

  async getAllJob(currentPage: number, limit: number, qr: string) {
    const { filter, sort, population, projection } = aqp(qr);
    delete filter.page;
    delete filter.pageSize;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10

    const totalItems = await this.jobModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
      .populate({
        path: 'companyId',  // Populate companyId to get the company name
        select: 'name',      // Only select the name of the company
      })
      .select('name quantity salary level isActive createdAt skills')  // Select only required fields
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


  async getJobByCompany(companyId: string, currentPage: number, limit: number, qr: string) {
    const { filter, sort } = aqp(qr) as { filter: { [key: string]: any }; sort: any };

    if ('page' in filter) delete filter.page;
    if ('pageSize' in filter) delete filter.pageSize;
    // Kết hợp filter với companyId
    const combinedFilter = { ...filter, companyId };

    // Loại bỏ các tham số phân trang không liên quan trong filter

    // Tính toán phân trang
    const defaultLimit = limit || 10;
    const skip = (currentPage - 1) * defaultLimit;

    // Đếm tổng số mục
    const totalItems = await this.jobModel.countDocuments(combinedFilter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Truy vấn dữ liệu với filter, phân trang và sắp xếp
    const result = await this.jobModel
      .find(combinedFilter)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
      .select('-updatedAt -isDeleted -deletedAt -createBy -__v -description -requirement -prioritize -location -latitude -longitude') // Lựa chọn trường cần thiết
      .exec();

    // Trả về kết quả với meta
    return {
      meta: {
        currentPage: currentPage,
        pageSize: defaultLimit,
        totalItems: totalItems,
        totalPages: totalPages,
      },
      result,
    };
  }

  async getJobKey(currentPage: number, limit: number, qr: string) {
    const { filter, sort, population, projection } = aqp(qr);
    delete filter.page;
    delete filter.pageSize;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;

    const searchQuery = { ...filter, isActive: true };
    

    const totalItems = await this.jobModel.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.jobModel
      .find(searchQuery)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
      .populate({
        path: 'companyId',
        select: 'name avatar',
      })
      .select('name jobType createdAt skills city')
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



  async getJobNearby(latitude: number, longitude: number, radius: number) {
    const radiusInDegrees = radius / 111.32;

    const result = await this.jobModel.find({
      isActive: true,
      latitude: {
        $gte: latitude - radiusInDegrees,
        $lte: latitude + radiusInDegrees,
      },
      longitude: {
        $gte: longitude - radiusInDegrees,
        $lte: longitude + radiusInDegrees,
      },
    })
      .sort({ createdAt: -1 })
      .populate({
        path: 'companyId',
        select: 'name avatar slogan',
      })
      .select('-updatedAt -isDeleted -deletedAt -createBy -__v -description -requirement -prioritize -location -skills -endDate -startDate -quantity ')
      .exec();

    const totalJobs = result.length;

    return {
      meta: {
        totalJobs: totalJobs
      },
      result
    };
  }



}
