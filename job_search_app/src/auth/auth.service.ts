import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { User } from 'src/common/decorator/customize';
import { RolesService } from 'src/roles/roles.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UserDocument } from 'src/users/schemas/user.schema';
import { IUser } from 'src/users/users.interface';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {


  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private rolesService: RolesService

  ) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOneByEmail(username);
    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password)
      if (isValid === true) {
        const userRole = user.role as unknown as { _id: string, name: string }
        const temp = await this.rolesService.getRoleDetail(userRole._id)

        const objUser = {
          ...user.toObject(),
          permissions: temp?.permissions ?? []
        }
        return objUser
      }
    }
    return null;
  }


  async login(user: IUser) {
    const { _id, email, role, avatar, permisstions } = user;
    const payload = {
      sub: "token login",
      iss: "from server",
      _id,
      email,
      role
    }

    return {
      access_token: this.jwtService.sign(payload),
      _id,
      email,
      avatar,
      role,
      permisstions
    };
  }


}

