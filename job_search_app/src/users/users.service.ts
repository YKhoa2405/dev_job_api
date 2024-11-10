import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { IUser } from './users.interface';
import { ConfigService } from '@nestjs/config';
import { Role, RoleDocument } from 'src/roles/schemas/role.schema';
import aqp from 'api-query-params';


@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,

    private configService: ConfigService

  ) { }

  getHashPassword = (password: string) => {
    var salt = genSaltSync(10);
    var hash = hashSync(password, salt);
    return hash
  }

  isValidPassword = (password: string, hash: string) => {
    return compareSync(password, hash);
  }


  async registerUser(CreateUserDto: CreateUserDto) {
    const { email, name, password, avatar, role } = CreateUserDto
    const isExits = await this.userModel.findOne({ email })
    if (isExits) {
      throw new BadRequestException('Nguoi dung da ton tai')
    }
    const userRole = await this.roleModel.findOne({ name: 'NORMAL_USER' })
    console.log(userRole)
    const hashPassword = this.getHashPassword(password)
    const newRegister = await this.userModel.create({
      email, name, password: hashPassword, avatar,
      role: {
        _id: userRole?._id
      }
    })
    console.log(newRegister)
    return newRegister;
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto, avatar: string) {
    if (avatar) {
      updateUserDto.avatar = avatar;
    }
    return this.userModel.updateOne({ _id: id }, { ...updateUserDto });
  }

  async removeUser(id: string, user: IUser) {
    const emailAdmin = this.configService.get<string>('ADMIN')
    const findRoleUser = this.userModel.findById(id)

    if ((await findRoleUser).email === emailAdmin) {
      throw new BadRequestException('khong the xoa admin')
    }
    await this.userModel.updateOne({ _id: id }, {
      deleteBy: {
        _id: user._id,
        email: user.email
      }
    })
    return this.userModel.softDelete({ _id: id })
  }

  findOneByEmail(username: string) {
    return this.userModel.findOne({
      email: username
    }).populate({ path: 'role', select: { name: 1 } });
  }


  getUserDetail(id: string) {
    return this.userModel.findOne({
      _id: id
    }).select('-password').populate({ path: 'role', select: { name: 1, _id: 1 } });
  }

  async getAllUser(currentPage: number, limit: number, qr: string) {

    const { filter, sort, population } = aqp(qr);
    delete filter.page
    delete filter.pageSize

    const skip = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10

    const totalItems = (await this.userModel.find(filter)).length
    const totalPages = Math.ceil(totalItems / limit);

    const result = await this.userModel.find(filter).
      skip(skip).
      limit(defaultLimit).
      sort({ createdAt: -1 }).
      populate(population).
      exec()

    return {
      meata: {
        currentPage: currentPage,
        pageSize: limit,
        totalItems: totalItems,
        totalPages: totalPages
      },
      result
    };
  }


  async findOrCreate(userData: any) {
    const { email, avatar } = userData;
    let user = await this.userModel.findOne({ email });
    if (!user) {
      user = new this.userModel({ email, avatar });
      await user.save();
    }
    return user;
  }
}
