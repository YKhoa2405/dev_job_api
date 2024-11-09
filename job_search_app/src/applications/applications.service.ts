import { Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dto/create-application.dto';
import { UpdateApplicationDto } from './dto/update-application.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Application, ApplicationDocument } from './schemas/application.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class ApplicationsService {
  constructor(@InjectModel(Application.name) private applycationModel: SoftDeleteModel<ApplicationDocument>) { }

  async createApplyJob(createApplicationDto: CreateApplicationDto, user: IUser, cvUrl: string) {
    const { companyId, jobId, name, phone, email } = createApplicationDto
    let newApply = await this.applycationModel.create({
      jobId, companyId,
      userId: user._id,
      name, phone, email,
      cv: cvUrl,
      createBy: {
        _id: user._id,
        email: email
      }
    })
    return newApply;
  }

  async getAllApplication(currentPage: number, limit: number, qr: string) {
    const { filter, sort, population, projection } = aqp(qr)
    delete filter.currentPage
    delete filter.limit

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10

    const totalItems = (await this.applycationModel.find()).length;
    const totalPages = Math.ceil(totalItems / defaultLimit)


    const result = await this.applycationModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort({ createdAt: -1 })  // Sắp xếp giảm dần theo createdAt
      .populate([
        {
          path: 'jobId',
          select: 'name salary level',
        },
        {
          path: 'companyId',
          select: 'name avatar slogan',
        },
      ])
      .select('-updatedAt -isDeleted -deletedAt -createBy -__v')
      .exec();

    return {
      meata: {
        currentPage: currentPage,
        pageSize: limit,
        totalItems: totalItems,
        totalPages: totalPages
      },
      result
    }
  }

  async getApplicationByUser(user: IUser) {
    return await this.applycationModel
      .find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate([
        {
          path: 'jobId',
          select: 'name salary level',
        },
        {
          path: 'companyId',
          select: 'name avatar slogan',
        },
      ])
      .exec();
  }

  getApplicationDetail(id: string) {
    return this.applycationModel.findOne({ _id: id }).populate([
      {
        path: 'jobId',
        select: 'name salary level',
      },
      {
        path: 'companyId',
        select: 'name avatar slogan',
      },
    ])
      .exec();;
  }

  updateApplication(id: string, updateApplicationDto: UpdateApplicationDto, user: IUser) {
    return this.applycationModel.updateOne({ _id: id }, {
      ...updateApplicationDto,
      updateBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  removeApplication(id: string) {
    return this.applycationModel.deleteOne({ _id: id });
  }
}
