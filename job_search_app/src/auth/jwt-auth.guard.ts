
import { ExecutionContext, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
import { IS_PUBLIC_KEY } from 'src/common/decorator/customize';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }
    return super.canActivate(context);
  }

  handleRequest(err, user, info, contex: ExecutionContext) {
    const request: Request = contex.switchToHttp().getRequest()
    // You can throw an exception based on either "info" or "err" arguments
    if (err || !user) {
      throw err || new UnauthorizedException();
    }

    const targetMethod = request.method
    const targetEndpoint = request.route?.path

    const permissions = user?.permissions ?? []
    const isExits = permissions.find(permissions =>
      targetEndpoint === permissions.apiPath
      &&
      targetMethod === permissions.method
    )
    // if (!isExits) {
    //   throw new ForbiddenException('Không thể truy cập')
    // }
    return user;
  }

}
