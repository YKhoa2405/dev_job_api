import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import { Model } from 'mongoose';
import aqp from 'api-query-params';
import { Order } from 'src/orders/schemas/order.schema';

@Injectable()
export class ServicesService {
  constructor(
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    @InjectModel(Order.name) private orderModel: Model<Order>
  ) { }


  createService(createServiceDto: CreateServiceDto, user: IUser) {
    if (!user || !user._id) {
      throw new Error('User information is incomplete or missing');
    }
    return this.serviceModel.create({
      ...createServiceDto,
      createBy: {
        _id: user._id,
        email: user.email
      }
    });
  }

  async getAllService(currentPage: number, limit: number, qr: string) {

    const { filter, sort, population, projection } = aqp(qr);

    delete filter.page;
    delete filter.pageSize;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;

    const totalItems = await this.serviceModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.serviceModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })
      .populate(population)
      .select('name description price durationDays isActive createdAt code')
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

  async getServiceDetail(id: string) {
    try {
      // Tìm chi tiết dịch vụ
      const serviceDetail = await this.serviceModel.findOne({ _id: id }).exec();
      if (!serviceDetail) {
        throw new Error('Dịch vụ không tồn tại');
      }

      // Đếm số lượng đơn hàng có serviceId bằng id
      const orderCount = await this.orderModel.countDocuments({ serviceId: id }).exec();

      // Trả về chi tiết dịch vụ kèm số lượng đơn hàng
      return {
        ...serviceDetail.toObject(), // Chuyển document thành object thuần
        orderCount, // Thêm trường số lượng đơn hàng
      };
    } catch (error) {
      throw new Error(`Lỗi khi lấy chi tiết dịch vụ: ${error.message}`);
    }
  }


  updateService(id: string, updateServiceDto: UpdateServiceDto, user: IUser) {
    return this.serviceModel.updateOne({ _id: id },
      {
        ...updateServiceDto,
        updateBy: {
          _id: user._id,
          email: user.email
        }
      });
  }

  removeService(id: string) {
    return this.serviceModel.deleteOne({ _id: id });
  }
}
