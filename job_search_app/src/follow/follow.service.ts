import { Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Follow } from './schemas/follow.schema';
import { Company } from 'src/companies/schemas/company.schema';
import { User } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private followModel: Model<Follow>,  // Inject Follow model
    @InjectModel(Company.name) private companyModel: Model<Company>,  // Inject Company model
  ) { }

  async getFollowByUser(currentPage: number, limit: number, qr: string, userId: string) {
    const { filter, sort } = aqp(qr) as { filter: { [key: string]: any }; sort: any };

    if ('page' in filter) delete filter.page;
    if ('pageSize' in filter) delete filter.pageSize;
    // Kết hợp filter với companyId
    const combinedFilter = { ...filter, userId };

    // Loại bỏ các tham số phân trang không liên quan trong filter

    // Tính toán phân trang
    const defaultLimit = limit || 10;
    const skip = (currentPage - 1) * defaultLimit;

    // Đếm tổng số mục
    const totalItems = await this.followModel.countDocuments(combinedFilter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    // Truy vấn dữ liệu với filter, phân trang và sắp xếp
    const result = await this.followModel
      .find(combinedFilter)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 }) // Sắp xếp dựa trên sort từ `aqp` hoặc mặc định
      .populate({
        path: 'companyId',
        select: 'name avatar slogan size',
      })
      .select('userId') // Lựa chọn trường cần thiết
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



  async followCompany(userId: string, companyId: string) {
    const existingFollow = await this.followModel.findOne({ userId, companyId });
    if (existingFollow) {
      return { message: 'User already follows this company' };
    }

    const follow = this.followModel.create({ userId, companyId });

    await this.companyModel.updateOne(
      { _id: companyId },
      { $inc: { followers: 1 } }
    );

    return follow
  }


  async unFollowCompany(userId: string, companyId: string) {
    const existingFollow = await this.followModel.findOne({ userId, companyId });
    if (!existingFollow) {
      return { message: 'Successfully unfollowed the company' };
    }

    await this.followModel.deleteOne({ userId, companyId });

    await this.companyModel.updateOne(
      { _id: companyId },
      { $inc: { followers: -1 } }
    );

    return { message: 'Successfully unfollowed the company' };
  }

  async isCompanySaved(userId: string, companyId: string) {
    const existingFollow = await this.followModel.findOne({ userId, companyId });

    // Nếu tồn tại, trả về true, ngược lại trả về false
    return { saved: !!existingFollow };
  }
}
