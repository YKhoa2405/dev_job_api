import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import aqp from 'api-query-params';
import { IUser } from 'src/users/users.interface';
import { Service, ServiceDocument } from 'src/services/schemas/service.schema';
import { Cron } from '@nestjs/schedule';
import { NotificationsGateway } from 'src/notifications/notifications.gateway';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    private readonly notificationsGateway: NotificationsGateway
  ) { }

  private calculateEndDate(startDate: Date, duration: number): Date {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + duration);
    return endDate;
  }

  async createOrder(createOrderDto: CreateOrderDto, user: IUser) {
    const { serviceId, companyId, amount, startDate, remainingUses } = createOrderDto;

    // Kiểm tra service tồn tại
    const service = await this.serviceModel.findById(serviceId).lean().exec();
    // Kiểm tra order hiện tại
    const existingOrder = await this.orderModel
      .findOne({
        serviceId,
        companyId,
      })
      .exec();

    if (existingOrder) {
      // Cộng dồn amount và kéo dài endDate
      existingOrder.endDate = this.calculateEndDate(existingOrder.endDate, service.durationDays);
      existingOrder.remainingUses = existingOrder.remainingUses + (service.usageLimit || 0);
      existingOrder.amount += service.price;
      await existingOrder.save();
      return existingOrder;
    }

    const initialRemainingUses = remainingUses !== undefined ? remainingUses : service.usageLimit;

    // Tạo order mới
    const newOrder = await this.orderModel.create({
      companyId,
      serviceId,
      amount: service.price,
      code: service.code,
      startDate: startDate || new Date(),
      endDate: this.calculateEndDate(startDate || new Date(), service.durationDays),
      remainingUses: initialRemainingUses,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });

    const notificationDto = {
      userId: companyId.toString(),
      type: 'NEW_ORDER',
      title: 'Mua dịch vụ thành công',
      message: `Bạn đã mua thành công dịch vụ ${service.name}.`,
      data: {
        serviceId: service._id.toString(),
      },
    };

    await this.notificationsGateway.sendNotification(companyId.toString(), notificationDto);
    return newOrder;
  }

  async getAllOrder(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.page;
    delete filter.limit;

    // Handle date range filtering for createdAt
    if (filter.createdAtFrom || filter.createdAtTo) {
      filter.createdAt = {};
      if (filter.createdAtFrom) {
        filter.createdAt.$gte = new Date(filter.createdAtFrom);
      }
      if (filter.createdAtTo) {
        filter.createdAt.$lte = new Date(filter.createdAtTo);
      }
      // Remove the original fields to avoid conflicts
      delete filter.createdAtFrom;
      delete filter.createdAtTo;
    }

    const skip = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    // Tổng số phần tử
    const totalItems = (await this.orderModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.orderModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 }) // Keep your existing sort
      .populate([
        { path: 'serviceId', select: 'name' },
        { path: 'companyId', select: 'name' }
      ])
      .exec();

    return {
      meta: {
        currentPage: currentPage,
        pageSize: defaultLimit,
        totalItems: totalItems,
        totalPages: totalPages
      },
      result
    };
  }

  async getOrderByCompany(id: string) {
    const order = await this.orderModel
      .find({ companyId: id })
      .populate('serviceId', 'name price',)
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

  async getOrderDetail(id: string) {
    const order = await this.orderModel.findOne({ _id: id })
      .populate({
        path: 'serviceId',
        select: 'name', // Chỉ lấy trường name của service
      })
      .populate({
        path: 'companyId',
        select: 'name', // Nếu muốn lấy thêm tên công ty
      });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
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
