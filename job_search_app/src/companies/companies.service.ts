import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Company, CompanyDocument } from './schemas/company.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class CompaniesService {

  constructor(
    @InjectModel(Company.name) private companyModel: SoftDeleteModel<CompanyDocument>
  ) { }

  async createCompany(createCompanyDto: CreateCompanyDto, user: IUser) {
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
      createBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  updateCompany(updateCompanyDto: UpdateCompanyDto, user: IUser, avatar?: string) {
    if (avatar) {
      updateCompanyDto.avatar = avatar; // Chỉ cập nhật nếu avatar có giá trị
    }
    return this.companyModel.updateOne(
      { _id: updateCompanyDto._id },
      {
        ...updateCompanyDto,
        updateBy: {
          _id: user._id,
          email: user.email
        }
      });
  }

  async removeCompany(id: string, user: IUser) {
    await this.companyModel.updateOne({ _id: id }, {
      deleteBy: {
        _id: user._id,
        email: user.email
      }
    })
    return this.companyModel.softDelete({ _id: id });
  }


  async getAllCompany(currentPage: number, qr: string) {
    // Sử dụng aqp để phân tích chuỗi query
    const { filter, sort, population } = aqp(qr);
    delete filter.page

    const limit = 10
    // Tính toán số lượng bản ghi cần bỏ qua dựa trên trang hiện tại và số phần tử mỗi trang
    const skip = (+currentPage - 1) * +limit;
    // Số phần tử của 1 trang
    const defaultLimit = +limit ? +limit : 10

    // Tổng số phần tử
    const totalItems = (await this.companyModel.find(filter)).length
    // Tính toán tổng số trang
    const totalPages = Math.ceil(totalItems / limit);


    const result = await this.companyModel.find(filter).
      skip(skip).
      limit(defaultLimit).
      sort().
      populate(population).
      exec()

    return {
      meta: {
        currentPage: currentPage,
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

  async getCompanyByCityAndName(currentPage: number, qr: string) {
    // Sử dụng aqp để phân tích chuỗi query
    const { filter, sort, population } = aqp(qr);
    delete filter.page

    filter.isDeleted = false;
    if (filter.city) {
      filter.city = filter.city; // Thêm vào filter để tìm kiếm theo thành phố
    }

    if (filter.name) {
      filter.name = { $regex: filter.name, $options: 'i' }; // Regex để tìm kiếm không phân biệt hoa/thường
    }

    const limit = 10;
    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit;

    const totalItems = await this.companyModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / limit);


    const result = await this.companyModel.find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort()
      .populate(population)
      .exec();

    return {
      meta: {
        currentPage,
        totalItems,
        totalPages,
      },
      result,
    }
  }


}
