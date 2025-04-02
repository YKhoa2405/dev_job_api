import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import aqp from 'api-query-params';
import { InjectModel } from '@nestjs/mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { Model } from 'mongoose';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,

  ) { }
  create(createNotificationDto: CreateNotificationDto, userId: string) {
    const notification = new this.notificationModel({ ...createNotificationDto, userId });
    notification.save();
    return notification
  }

  async findAllByUser(
    userId: string, // Thêm userId làm tham số bắt buộc
    currentPage: number,
    limit: number,
    qr: string,
  ) {
    const { filter, sort, population } = aqp(qr || '');
    delete filter.page;
    delete filter.limit;

    // Thêm userId vào filter để chỉ lấy thông báo của người dùng này
    filter.userId = userId;

    // Xử lý lọc theo khoảng thời gian createdAt
    if (filter.createdAtFrom || filter.createdAtTo) {
      filter.createdAt = {};
      if (filter.createdAtFrom) {
        filter.createdAt.$gte = new Date(filter.createdAtFrom);
      }
      if (filter.createdAtTo) {
        filter.createdAt.$lte = new Date(filter.createdAtTo);
      }
      delete filter.createdAtFrom;
      delete filter.createdAtTo;
    }

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10;

    // Tổng số thông báo của userId
    const totalItems = (await this.notificationModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.notificationModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 }) // Sử dụng sort từ query hoặc mặc định
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

  findOne(id: number) {
    return `This action returns a #${id} notification`;
  }

  update(id: number, updateNotificationDto: UpdateNotificationDto) {
    return `This action updates a #${id} notification`;
  }

  async removeAllByUser(userId: string) {
    const result = await this.notificationModel.deleteMany({ userId }).exec();
    return { deletedCount: result.deletedCount };
  }
}
