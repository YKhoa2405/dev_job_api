import { ForbiddenException, Injectable, Request } from '@nestjs/common';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Job, JobDocument, JobLevel, JobType } from './schemas/job.schema';
import { User } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { Skill } from 'src/skills/schemas/skill.schema';
import { Application } from 'src/applications/schemas/application.schema';
import { Order } from 'src/orders/schemas/order.schema';

@Injectable()
export class JobsService {
  constructor(
    @InjectModel(Job.name) private jobModel: Model<JobDocument>,
    @InjectModel(Application.name) private applicationModel: Model<Application>,
    @InjectModel(Skill.name) private skillModel: Model<Skill>,
    @InjectModel(Order.name) private orderModel: Model<Order>,


  ) { }

  async createJob(createJobDto: CreateJobDto, user: IUser) {
    const { companyId } = createJobDto;

    // Bắt đầu transaction để đảm bảo tính nhất quán
    const session = await this.orderModel.startSession();
    session.startTransaction();

    try {
      // Kiểm tra gói dịch vụ còn lượt sử dụng hay không
      const order = await this.orderModel.findOne({
        companyId: companyId,
        code: 'CREATE_JOB_PACKAGE',
        remainingUses: { $gt: 0 }, // Còn lượt sử dụng
        endDate: { $gte: new Date() }, // Chưa hết hạn
      }).session(session);

      if (!order) {
        throw new ForbiddenException(
          'Bạn cần mua "Gói 30 tin tuyển dụng" để thực hiện.'
        );
      }

      // Giảm số lượt sử dụng trước khi tạo công việc
      order.remainingUses -= 1;
      await order.save({ session });

      // Tạo công việc
      const newJob = await this.jobModel.create([{
        ...createJobDto,
        createBy: {
          _id: user._id,
          email: user.email,
        },
      }], { session });

      // Cập nhật độ phổ biến của kỹ năng
      const skillNames = createJobDto.skills;
      await this.skillModel.updateMany(
        { name: { $in: skillNames } },
        { $inc: { popularity: 1 } },
        { session }
      );

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      return newJob[0]; // Vì `create()` với mảng trả về một mảng, lấy phần tử đầu tiên
    } catch (error) {
      // Rollback nếu có lỗi
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }



  async getJobDetail(jobId: string, userId: string) {
    const job = await this.jobModel
      .findOne({ _id: jobId })
      .populate('companyId', 'name avatar')
      .lean();

    // Kiểm tra ứng viên đã ứng tuyển chưa
    const hasApplied = await this.applicationModel.exists({
      jobId,
      userId,
      isDeleted: false, // Đảm bảo đơn ứng tuyển chưa bị xóa
    });

    return { ...job, hasApplied: !!hasApplied };
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
      .lean()
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

    // Loại bỏ các tham số không cần thiết khỏi filter
    delete filter.page;
    delete filter.pageSize;

    // Kết hợp filter với companyId (dùng object spread tối ưu)
    const combinedFilter = { companyId, ...filter };

    // Tối ưu phân trang
    const pageLimit = limit || 10;
    const skip = (currentPage - 1) * pageLimit;

    // Sử dụng lean() và truy vấn đồng thời để tăng tốc độ
    const [totalItems, result] = await Promise.all([
      this.jobModel.countDocuments(combinedFilter).lean().exec(),
      this.jobModel
        .find(combinedFilter)
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 })
        .select('-updatedAt -isDeleted -deletedAt -createBy -__v -description -requirement -prioritize -location -latitude -longitude')
        .lean() // Chuyển thành plain object
        .exec(),
    ]);

    // Tính toán totalPages sau khi có totalItems
    const totalPages = Math.ceil(totalItems / pageLimit);

    return {
      meta: {
        currentPage,
        pageSize: pageLimit,
        totalItems,
        totalPages,
      },
      result,
    };
  }

  async getJobKey(currentPage: number, limit: number, qr: string) {
    const { filter, sort, population, projection } = aqp(qr);

    // Loại bỏ các tham số không cần thiết
    delete filter.page;
    delete filter.pageSize;

    // Tối ưu phân trang
    const pageLimit = limit || 10;
    const skip = (currentPage - 1) * pageLimit;

    // Kết hợp filter với điều kiện mặc định
    const searchQuery = { isActive: true, ...filter };

    // Thực hiện truy vấn song song
    const [totalItems, result] = await Promise.all([
      this.jobModel.countDocuments(searchQuery).lean().exec(),
      this.jobModel
        .find(searchQuery)
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 })
        .populate({
          path: 'companyId',
          select: 'name avatar',
        })
        .select('name jobType createdAt skills city')
        .lean() // Tối ưu hiệu suất
        .exec(),
    ]);

    // Tính toán totalPages
    const totalPages = Math.ceil(totalItems / pageLimit);

    return {
      meta: {
        currentPage,
        pageSize: pageLimit,
        totalItems,
        totalPages,
      },
      result,
    };
  }



  async getJobNearby(latitude: number, longitude: number, radius: number) {
    const radiusInDegrees = radius / 111.32; // Chuyển km sang độ (gần đúng)

    const searchQuery = {
      isActive: true,
      latitude: {
        $gte: latitude - radiusInDegrees,
        $lte: latitude + radiusInDegrees,
      },
      longitude: {
        $gte: longitude - radiusInDegrees,
        $lte: longitude + radiusInDegrees,
      },
    };

    // Thực hiện truy vấn với lean() để tối ưu
    const result = await this.jobModel
      .find(searchQuery)
      .sort({ createdAt: -1 })
      .populate({
        path: 'companyId',
        select: 'name avatar slogan',
      })
      .select('-updatedAt -isDeleted -deletedAt -createBy -__v -description -requirement -prioritize -location -skills -endDate -startDate -quantity')
      .lean() // Tăng hiệu suất
      .exec();

    const totalJobs = result.length;

    return {
      meta: {
        totalJobs,
      },
      result,
    };
  }

}
