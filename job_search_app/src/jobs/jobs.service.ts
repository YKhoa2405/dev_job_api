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


  findAll() {
    return `This action returns all jobs`;
  }

  getJobDetail(id: string) {
    return this.jobModel
      .findOne({ _id: id })
      .populate('companyId', 'name') // Lấy thông tin 'name' từ model Company
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
      .sort(sort as any)
      .populate({
        path: 'companyId',  // Populate companyId to get the company name
        select: 'name',      // Only select the name of the company
      })
      .select('name quantity salary level isActive createdAt')  // Select only required fields
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

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10

    const totalItems = await this.jobModel.countDocuments({ companyId });
    const totalPages = Math.ceil(totalItems / limit);

    const result = await this.jobModel
      .find({ companyId })
      .skip(skip)
      .limit(defaultLimit)
      // .populate('companyId', 'name slogan avatar')
      // .populate('companyId', 'name slogan avatar')
      .select('-updatedAt -isDeleted -deletedAt -createBy -__v -description -requirement -prioritize -location -latitude -longitude')
      .exec();


    return {
      meta: {
        currentPage: currentPage,
        pageSize: limit,
        totalItems: totalItems,
        totalPages: totalPages
      },
      result
    };

  };

  async getJobNearby(latitude: number, longitude: number, radius: number) {
    const radiusInDegrees = radius / 111.32;

    const jobs = await this.jobModel.find({
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
      .select('-updatedAt -isDeleted -deletedAt -createBy -__v -description -requirement -prioritize -location -latitude -longitude')
      .exec();

    const totalJobs = jobs.length;

    return {
      meta: {
        totalJobs: totalJobs
      },
      jobs
    };
  }

}
