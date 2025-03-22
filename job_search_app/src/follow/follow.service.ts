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

    // Loại bỏ các tham số không cần thiết
    delete filter.page;
    delete filter.pageSize;

    // Kết hợp filter với userId
    const combinedFilter = { userId, ...filter };

    // Tối ưu phân trang
    const pageLimit = limit || 10;
    const skip = (currentPage - 1) * pageLimit;

    // Thực hiện truy vấn song song
    const [totalItems, result] = await Promise.all([
      this.followModel.countDocuments(combinedFilter).lean().exec(),
      this.followModel
        .find(combinedFilter)
        .skip(skip)
        .limit(pageLimit)
        .sort(sort || { createdAt: -1 }) // Sử dụng sort từ aqp nếu có, mặc định createdAt
        .populate({
          path: 'companyId',
          select: 'name avatar slogan size followers',
        })
        .select('userId') // Chỉ lấy trường cần thiết
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
