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
import { MailService } from 'src/mail/mail.service';


@Injectable()
export class UsersService {

  private codes = new Map<string, string>();
  private expirationTime = 120000; // 120 giây = 120000 ms
  constructor(
    @InjectModel(User.name) private userModel: SoftDeleteModel<UserDocument>,
    @InjectModel(Role.name) private roleModel: SoftDeleteModel<RoleDocument>,

    private mailService: MailService,
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

  generatecode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createUser(createUserDto: CreateUserDto) {
    const { email, name, password, role } = createUserDto;
    const isExits = await this.userModel.findOne({ email });
    if (isExits) {
      throw new BadRequestException('Người dùng đã tồn tại');
    }
    const hashPassword = this.getHashPassword(password)

    await this.userModel.create({
      email,
      name,
      password: hashPassword,
      role
    });

    return { message: 'Đăng ký thành công.' };
  }

  async registerUser(createUserDto: CreateUserDto) {
    const { email, name } = createUserDto;
    const isExits = await this.userModel.findOne({ email });
    if (isExits) {
      throw new BadRequestException('Người dùng đã tồn tại');
    }

    // Tạo mã xác minh và lưu vào Map
    const code = this.generatecode();
    this.codes.set(email, code);

    // Gửi email xác minh qua MailService
    await this.mailService.sendVerificationEmail(email, name, code);

    setTimeout(() => {
      this.codes.delete(email);
    }, this.expirationTime);

    return { message: 'Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.' };
  }

  async verifyUser(code: string, createUserDto: CreateUserDto, roleName: string) {
    const { email, name, password, avatar, role } = createUserDto
    const storedCode = this.codes.get(email);
    console.log(role)
    if (!storedCode) {
      throw new BadRequestException('Không tìm thấy mã xác minh cho email này.');
    }

    if (storedCode !== code) {
      throw new BadRequestException('Mã xác minh không đúng.');
    }

    // Nếu mã xác minh đúng, tạo người dùng

    const userRole = await this.roleModel.findOne({ name: roleName });

    const hashPassword = this.getHashPassword(password)

    // Tạo người dùng
    const newUser = await this.userModel.create({
      email,
      name,
      password: hashPassword,
      avatar,
      role: userRole?._id
    });

    // Xóa mã khỏi Map sau khi sử dụng
    this.codes.delete(email);

    return { message: 'Tài khoản đã được xác minh và tạo thành công.' };
  }

  // Change Password
  async sendForgotPassCode(createUserDto: CreateUserDto) {
    const { email } = createUserDto
    const isExits = await this.userModel.findOne({ email });
    if (!isExits) {
      throw new BadRequestException('Không tìm thấy Email');
    }
    const code = this.generatecode();
    this.codes.set(email, code);
    await this.mailService.sendForgotPassEmail(email, code);
    setTimeout(() => this.codes.delete(email), 120000); // Xóa mã sau 120 giây
  }

  // Thay đổi mật khẩu
  async changePasswordWithCode(email: string, newPassword: string, code: string): Promise<any> {
    // const { email } = createUserDto

    const storedCode = this.codes.get(email);
    if (!storedCode) {
      throw new BadRequestException('Không tìm thấy mã xác minh cho email này.');
    }

    if (storedCode !== code) {
      throw new BadRequestException('Mã xác minh không đúng.');
    }

    // Tìm người dùng theo email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new BadRequestException('Người dùng không tồn tại.');
    }

    // Băm mật khẩu mới
    const hashedPassword = this.getHashPassword(newPassword);

    // Cập nhật mật khẩu người dùng
    user.password = hashedPassword;
    await user.save();

    // Xóa mã xác minh đã sử dụng
    this.codes.delete(email);

    return { message: 'Mật khẩu đã được thay đổi thành công.' };
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

    const { filter, sort, population, projection } = aqp(qr);
    delete filter.page
    delete filter.pageSize

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10

    const totalItems = await this.userModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter).
      skip(skip).
      limit(defaultLimit).
      sort({ createdAt: -1 }).
      populate('role', 'name').
      exec()

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
