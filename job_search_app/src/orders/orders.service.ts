import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import aqp from 'api-query-params';
import { IUser } from 'src/users/users.interface';
import { Service, ServiceDocument } from 'src/services/schemas/service.schema';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,

  ) { }

  private calculateEndDate(duration: number): Date {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + duration);
    return currentDate;
  }

  async createOrder(createOrderDto: CreateOrderDto, user: IUser) {
    const { serviceId, companyId, amount } = createOrderDto;

    const existingOrder = await this.orderModel.findOne({
      serviceId,
      companyId,
      isActive: true,
    });
    if (existingOrder) {
      const service = await this.serviceModel.findById(serviceId);
      const additionalDuration = service.durationDays;

      existingOrder.amount = Number(existingOrder.amount) + Number(amount);
      existingOrder.endDate = new Date(existingOrder.endDate.getTime() + additionalDuration * 24 * 60 * 60 * 1000);

      await existingOrder.save();
      return existingOrder;
    }

    const service = await this.serviceModel.findById(serviceId);
    const endDate = this.calculateEndDate(service.durationDays);

    const newOrder = this.orderModel.create({
      ...createOrderDto,
      endDate,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    })
    return newOrder
  }

  async getAllOrder(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.page
    delete filter.limit

    const skip = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10

    // Tổng số phần tử
    const totalItems = (await this.orderModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit);


    const result = await this.orderModel.find(filter).
      skip(skip).
      limit(defaultLimit).
      sort({ createdAt: -1 }).
      populate(population).
      exec()

    return {
      meta: {
        currentPage: currentPage,
        pageSize: defaultLimit,
        totalItems: totalItems,
        totalPages: totalPages
      }, result
    }
  }

  async getOrderByCompany(id: string) {
    const order = await this.orderModel
      .find({ companyId: id })
      .populate('serviceId', 'name')
      .exec();

    const totalAmount = order.reduce((sum, o) => sum + o.amount, 0);

    return {
      meta: {
        totalAmount,
        totalItems: order.length,
      },
      result: order,
    };
  }

  @Cron('0 0 * * *')
  async updateExpiredOrders() {
    const now = new Date();
    try {
      // Tìm các order hết hạn nhưng vẫn đang active
      const result = await this.orderModel.updateMany(
        { endDate: { $lt: now }, isActive: true }, // Điều kiện
        { $set: { isActive: false } },             // Hành động cập nhật
      );

      if (result.modifiedCount > 0) {
        console.log(
          `Deactivated ${result.modifiedCount} expired orders.`,
        );
      } else {
        console.log('No expired orders to deactivate.');
      }
    } catch (error) {
      console.error('Error updating expired orders', error);
    }
  }
}
