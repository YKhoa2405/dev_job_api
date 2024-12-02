import { IUser } from 'src/users/users.interface';
import { ConfigService } from '@nestjs/config';

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { RolesService } from 'src/roles/roles.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private rolesService: RolesService

  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_TOKEN'),
    });
  }

  async validate(payload: IUser) {
    const { _id, email, role, name, avatar } = payload
    const userRole = role as unknown as { _id: string, name: string }
    const temp = (await this.rolesService.getRoleDetail(userRole._id)).toObject()

    return {
      _id,
      email,
      role,
      permissions: temp?.permissions ?? []
    };
  }
}

// Giải mã token để xác định người dùng, token hợp lệ trả về thông tin người dùng