import { ForbiddenException, Injectable } from '@nestjs/common';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateCandidateDto } from './dto/update-candidate.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Candidate, CandidateDocument } from './schemas/candidate.schema';
import { Model } from 'mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { Order } from 'src/orders/schemas/order.schema';
import { Cv } from 'src/cv/schemas/cv.schema';

@Injectable()
export class CandidatesService {
  constructor(
    @InjectModel(Candidate.name) private model: Model<CandidateDocument>,
    @InjectModel(Order.name) private orderModel: Model<Order>,
    @InjectModel(Cv.name) private cvModel: Model<Cv>,

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

  async getAllCandidates(currentPage: number, limit: number, qr: string, companyId: string, user: IUser) {
    // Kiểm tra gói dịch vụ trước khi truy vấn
    if (user?.role.name !== 'SUPER_ADMIN') {
      const order = await this.orderModel.findOne({
        companyId: companyId,
        code: 'FIND_CADIDATES_PACKAGE', // Gói dịch vụ yêu cầu
        endDate: { $gte: new Date() }, // Chưa hết hạn
      });

      if (!order) {
        throw new ForbiddenException(
          'Bạn cần mua "Gói Xem Hồ Sơ Ứng Viên" để thực hiện.'
        );
      }
    }

    // Xử lý phân trang & truy vấn danh sách ứng viên
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


  async findOne(id: string) {
    // Tìm bản ghi Candidate
    const candidate = await this.model
      .findOne({
        userId: id,
        isDeleted: false,
      })
      .exec();
  
    if (!candidate) {
      return null; // Không tìm thấy ứng viên
    }
  
    // Tìm CV chính và chỉ lấy trường url
    const primaryCv = await this.cvModel
      .findOne({
        userId: id,
        isPrimary: true,
      })
      .select('url') // Chỉ lấy trường url
      .exec();
  
    // Kết hợp kết quả, đưa url ra ngoài
    return {
      ...candidate.toObject(),
      cvUrl: primaryCv?.url || null, // Trả về url trực tiếp, hoặc null nếu không có
    };
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
