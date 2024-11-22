import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Role, RoleDocument } from './schemas/role.schema';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from 'src/users/users.interface';
import aqp from 'api-query-params';

@Injectable()
export class RolesService {
  constructor(@InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>) { }


  async createRole(createRoleDto: CreateRoleDto) {
    const { name } = createRoleDto
    const isExits = await this.roleModel.findOne({ name: name })
    if (isExits) {
      throw new BadRequestException('Role da ton tai')
    }

    return await this.roleModel.create({
      ...createRoleDto,
    })
  }

  async getAllRole(currentPage: number, limit: number, qr: string) {
    const { filter, sort, population, projection } = aqp(qr);
    
    delete filter.page;
    delete filter.pageSize;
  
    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit || 10;
  
    const totalItems = await this.roleModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);
  
    const result = await this.roleModel
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
  

  async getRoleDetail(id: string) {
    return await this.roleModel
      .findById(id)
      .populate({ path: "permissions", select: { _id: 1, apiPath: 1, method: 1, module: 1 } })
      .exec();
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto, user: IUser) {
    const { name } = updateRoleDto
    const isExits = await this.roleModel.findOne({ name: name })
    if (isExits) {
      throw new BadRequestException('name Role da ton tai')
    }

    return await this.roleModel.updateOne({ _id: id }, {
      ...updateRoleDto,
      updateBy: {
        _id: user._id,
        email: user.email
      }
    })

  }

  async removeRole(id: string, user: IUser) {
    const findRole = this.roleModel.findById(id)
    if ((await findRole).name === 'AMIN') {
      throw new BadRequestException('khong the xoa ROLE ADMIN')
    }
    await this.roleModel.updateOne({ _id: id },
      {
        deleteBy: {
          _id: user._id,
          email: user.email
        }
      }
    )
    return this.roleModel.softDelete({ _id: id });
  }
}
