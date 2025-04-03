import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';
import { NotificationsService } from 'src/notifications/notifications.service';

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectModel(Application.name) private applicationModel: SoftDeleteModel<ApplicationDocument>,
    private notificationsService: NotificationsService
  ) { }

  async createApplyJob(createApplicationDto: CreateApplicationDto, user: IUser): Promise<Application> {
    const { companyId, jobId, name, phone, email, cv } = createApplicationDto;

    // Tạo object mới với các trường cần thiết
    const newApplyData = {
      jobId,
      companyId,
      userId: user._id,
      name,
      phone,
      email,
      cv,
      createBy: {
        _id: user._id,
        email, // Sử dụng email từ DTO
      },
    };

    const newApply = await this.applicationModel.create(newApplyData);

    // Populate để lấy thông tin job và company
    const populatedApply = await this.applicationModel
      .findById(newApply._id)
      .populate({
        path: 'jobId',
        select: 'name',
      })
      .exec();

    const jobTitle = populatedApply.jobId.name;

    // Gửi thông báo cho nhà tuyển dụng

    const notificationDto = {
      userId: companyId.toString(),
      type: 'NEW_APPLICATION',
      title: 'Ứng viên mới ứng tuyển',
      message: `Ứng viên mới vừa ứng tuyển vào ${jobTitle}.`,
      data: {
        jobId: jobId.toString(),
      }
    };

    await this.notificationsService.create(notificationDto, companyId.toString());

    return newApply;
  }

  async getAllApplication(currentPage: number, limit: number, qr: string) {
    const { filter, sort, population, projection } = aqp(qr)
    delete filter.page
    delete filter.limit

    const skip = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10

    const totalItems = (await this.applicationModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit)


    const result = await this.applicationModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })  // Sắp xếp giảm dần theo createdAt
      .populate([
        {
          path: 'jobId',
          select: 'name salary level isUrgent',
        },
        {
          path: 'companyId',
          select: 'name avatar',
        },
      ])
      .select('-updatedAt -isDeleted -deletedAt -createBy -__v')
      .lean()
      .exec();

    return {
      meta: {
        currentPage: currentPage,
        pageSize: defaultLimit,
        totalItems: totalItems,
        totalPages: totalPages
      }, result
    }
  }

  // async getApplicationByCompany(currentPage: number, limit: number, qr: string, companyId: string) {
  //   const { filter, sort, population, projection } = aqp(qr)
  //   delete filter.page
  //   delete filter.limit

  //   filter.companyId = companyId;

  //   const skip = (+currentPage - 1) * +limit;
  //   const defaultLimit = +limit ? +limit : 10

  //   const totalItems = (await this.applicationModel.find(filter)).length;
  //   const totalPages = Math.ceil(totalItems / defaultLimit)


  //   const result = await this.applicationModel
  //     .find(filter)
  //     .skip(skip)
  //     .limit(defaultLimit)
  //     .sort({ createdAt: -1 })
  //     .populate([
  //       {
  //         path: 'jobId',
  //         select: 'name',
  //       },
  //     ])
  //     .select('-updatedAt -isDeleted -deletedAt -createBy -__v')
  //     .exec();

  //   return {
  //     meta: {
  //       currentPage: currentPage,
  //       pageSize: defaultLimit,
  //       totalItems: totalItems,
  //       totalPages: totalPages
  //     }, result
  //   }
  // }

  async getApplicationByJob(currentPage: number, limit: number, qr: string, jobId: string) {
    const { filter, sort, population, projection } = aqp(qr)
    delete filter.page
    delete filter.limit

    // filter.jobId = jobId;
    const searchQuery = { ...filter, jobId: jobId };



    const skip = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10

    const totalItems = await this.applicationModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit)


    const result = await this.applicationModel
      .find(searchQuery)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
      .select('-updatedAt -isDeleted -deletedAt -createBy -__v')
      .exec();

    return {
      meta: {
        currentPage: currentPage,
        pageSize: defaultLimit,
        totalItems: totalItems,
        totalPages: totalPages
      }, result
    }
  }

  async getApplicationByUser(currentPage: number, limit: number, qr: string, user: IUser) {
    const { filter, sort, population, projection } = aqp(qr);

    // Loại bỏ các tham số không cần thiết
    delete filter.page;
    delete filter.limit;

    // Tối ưu phân trang
    const pageLimit = +limit || 10;
    const skip = (currentPage - 1) * pageLimit;

    // Kết hợp filter với userId
    const combinedFilter = { userId: user._id, ...filter };

    // Thực hiện truy vấn song song
    const [totalItems, result] = await Promise.all([
      this.applicationModel.countDocuments(combinedFilter).lean().exec(),
      this.applicationModel
        .find(combinedFilter)
        .skip(skip)
        .limit(pageLimit)
        .sort({ createdAt: -1 })
        .select('-name -phone -email -createBy -isDeleted -__v -deletedAt -updatedAt -slogan')
        .populate([
          {
            path: 'jobId',
            select: 'name salary level createdAt skills isUrgent',
          },
          {
            path: 'companyId',
            select: 'name avatar slogan',
          },
        ])
        .lean() // Tăng hiệu suất
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


  updateApplication(id: string, status: string, user: IUser) {
    return this.applicationModel.updateOne({ _id: id }, {
      status: status,
      updateBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  removeApplication(id: string) {
    return this.applicationModel.deleteOne({ _id: id });
  }

  findOne(id: string) {
    return this.applicationModel
      .findOne({ _id: id })
      .populate('companyId', 'name') // Lấy name từ companyId
      .populate('jobId', 'name'); // Lấy name từ jobId
  }

}
