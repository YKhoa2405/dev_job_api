import { Injectable } from '@nestjs/common';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Service, ServiceDocument } from './schemas/service.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import { Model } from 'mongoose';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service.name) private serviceModel: Model<ServiceDocument>) { }


  createService(createServiceDto: CreateServiceDto, user: IUser) {
    return this.serviceModel.create({
      ...createServiceDto,
      createBy: {
        _id: user._id,
        email: user.email
      }
    });
  }

  async getAllService() {
    return await this.serviceModel
      .find()
      .select('name description price durationDays isActive') // Chỉ chọn các trường cần thiết
      .exec();
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
