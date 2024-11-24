import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';
import { Job, JobDocument } from 'src/jobs/schemas/job.schema';

@Injectable()
export class CompaniesService {

  constructor(
    @InjectModel(Company.name) private companyModel: SoftDeleteModel<CompanyDocument>,
    @InjectModel(Job.name) private jobModel: SoftDeleteModel<JobDocument>

  ) { }

  async createCompany(createCompanyDto: CreateCompanyDto, user: IUser, avatar?: string) {
    const { name, website } = createCompanyDto;

    // Kiểm tra tên công ty hoặc website đã tồn tại hay chưa
    const existingCompany = await this.companyModel.findOne({
      $or: [{ name }, { website }],
    });

    if (existingCompany) {
      throw new BadRequestException('Cong ty da ton tai')
    }
    return this.companyModel.create({
      ...createCompanyDto,
      avatar: avatar,
      createBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  updateCompany(id: string, updateCompanyDto: UpdateCompanyDto, user: IUser, avatar?: string) {
    if (avatar) {
      updateCompanyDto.avatar = avatar;
    }
    return this.companyModel.updateOne(
      { _id: id },
      {
        ...updateCompanyDto,
        updateBy: {
          _id: user._id,
          email: user.email
        }
      });
  }

  async removeCompany(id: string, user: IUser) {
    await this.jobModel.deleteMany({ companyId: id });

    await this.companyModel.updateOne({ _id: id }, {
      deleteBy: {
        _id: user._id,
        email: user.email
      }
    })
    return this.companyModel.softDelete({ _id: id });
  }


  async getAllCompany(currentPage: number, limit: number, qs: string) {
    const { filter, sort, population } = aqp(qs);
    delete filter.page
    delete filter.limit

    const skip = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10

    // Tổng số phần tử
    const totalItems = (await this.companyModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / defaultLimit);


    const result = await this.companyModel.find(filter).
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

  getCompanyDetail(id: string) {
    return this.companyModel.findOne({
      _id: id,
      isDeleted: false
    });

  }



}
