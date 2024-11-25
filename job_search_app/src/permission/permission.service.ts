import { BadRequestException, Injectable } from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Permission, PermissionDocument } from './schemas/permission.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class PermissionService {
  constructor(@InjectModel(Permission.name) private permissionModel: SoftDeleteModel<PermissionDocument>) { }

  async createPermission(createPermissionDto: CreatePermissionDto, user: IUser) {
    const { apiPath, method, isDeleted, name } = createPermissionDto;
    const checkPermission = await this.permissionModel.findOne({ apiPath, method, isDeleted: false, name })
    if (checkPermission) {
      throw new BadRequestException('Permission with the same apiPath and method already exists');
    }
    return this.permissionModel.create({
      ...createPermissionDto,
      createBy: {
        _id: user._id,
        email: user.email
      }
    })
  }

  async getAllPermisstion(currentPage: number, limit: number, qr: string) {
    const { filter, sort, population, projection } = aqp(qr)
    delete filter.page;
    delete filter.pageSize;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10

    const totalItems = await this.permissionModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);


    const result = await this.permissionModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();
    return {
      meta: {
        currentPage,
        pageSize: defaultLimit,
        totalItems,
        totalPages,
      },
      result
    }
  }

  getPermissionsDetail(id: string) {
    return this.permissionModel.findOne({ _id: id })
  }

  updatePermission(id: string, updatePermissionDto: UpdatePermissionDto, user: IUser) {
    return this.permissionModel.updateOne({ _id: id }, {
      ...updatePermissionDto,
      updateBy: {
        _id: user._id,
        email: user.email
      }
    });
  }

  async removePermission(id: string, user: IUser) {
    await this.permissionModel.updateOne({ _id: id },
      {
        deleteBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.permissionModel.softDelete({ _id: id });
  }
}
