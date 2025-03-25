import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Candidate, CandidateDocument } from './schemas/candidate.schema';
import { Model } from 'mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { Order } from 'src/orders/schemas/order.schema';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name) private model: Model<CandidateDocument>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
  ) { }
  create(createCandidateDto: CreateCandidateDto, user: IUser) {
    return this.model.create({
      ...createCandidateDto,
      userId: user._id,
      createBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async getAllCandidates(currentPage: number, limit: number, qr: string, companyId:string) {
    // Kiểm tra gói dịch vụ trước khi truy vấn
    const order = await this.orderModel.findOne({
      companyId: companyId,
      code: 'FIND_CADIDATES_PACKAGE',  // Gói dịch vụ yêu cầu
      endDate: { $gte: new Date() }, // Chưa hết hạn
    });

    if (!order) {
      throw new ForbiddenException(
        'Bạn cần mua "Gói Xem Hồ Sơ Ứng Viên" để thực hiện.'
      );
    }

    // Xử lý phân trang & truy vấn danh sách ứng viên
    console.log(companyId)
    const { filter, sort, population, projection } = aqp(qr);
    delete filter.page;
    delete filter.pageSize;
    delete filter.companyId;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    const totalItems = await this.model.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.model
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
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


  findOne(id: string) {
    return this.model.findOne({
      userId: id,
      isDeleted: false
    });
  }

  update(id: string, updateCandidateDto: UpdateCandidateDto, user: IUser) {
    return this.model.updateOne(
      { userId: id },
      {
        ...updateCandidateDto,
        updateBy: {
          _id: user._id,
          email: user.email
        }
      });
  }

}
