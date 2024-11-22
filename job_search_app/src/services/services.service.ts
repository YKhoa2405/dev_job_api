import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service.name) private serviceModel: Model<ServiceDocument>) { }


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
      .select('name description price durationDays isActive createdAt')
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

  getServiceDetail(id: string) {
    return this.serviceModel.findOne({ _id: id })
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
