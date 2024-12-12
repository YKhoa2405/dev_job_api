import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import aqp from 'api-query-params';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
  ) { }

  async createOrder(createOrderDto: CreateOrderDto) {
    const newOrder = this.orderModel.create({
      ...createOrderDto
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
      .populate('serviceId', 'name price durationDays')
      .exec();

    const totalAmount = order.reduce((sum, o) => sum + parseFloat(o.amount), 0);

    return {
      meta: {
        totalAmount,
        totalOrder: order.length,
      },
      result: order,
    };
  }

}
