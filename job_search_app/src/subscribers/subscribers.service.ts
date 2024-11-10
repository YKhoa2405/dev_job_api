import { BadRequestException, Injectable } from '@nestjs/common';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Subscriber, SubscriberDocument } from './schemas/subscriber.schema';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class SubscribersService {
  constructor(@InjectModel(Subscriber.name) private subscriberModel: Model<SubscriberDocument>) { }

  async createSubscriber(createSubscriberDto: CreateSubscriberDto, user: IUser) {
    const { email } = createSubscriberDto;

    // Kiểm tra xem email đã tồn tại chưa
    const isEmailExists = await this.subscriberModel.findOne({ email });
    if (isEmailExists) {
      throw new BadRequestException('Email đã tồn tại');
    }

    return await this.subscriberModel.create({
      ...createSubscriberDto,
      createBy: {
        _id: user._id,
        email: user.email,
      },
    });
  }

  async getAllSubscribers(currentPage: number, limit: number, qr: string) {
    const { filter, sort, population, projection } = aqp(qr);

    delete filter.page;
    delete filter.pageSize;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;

    const totalItems = await this.subscriberModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.subscriberModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection as any)
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


  async updateSubscriber(id: string, updateSubscriberDto: UpdateSubscriberDto) {
    const { email, skills } = updateSubscriberDto;
    return await this.subscriberModel.updateOne(
      { _id: id },
      { email, skills }
    );
  }

  removeSubscriber(id: string) {
    return this.subscriberModel.deleteOne({ _id: id })
  }
}
