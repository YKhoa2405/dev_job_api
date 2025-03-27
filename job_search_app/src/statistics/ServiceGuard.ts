import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Request } from 'express';
import { Order } from 'src/orders/schemas/order.schema';

@Injectable()
export class ServiceGuard implements CanActivate {
    constructor(
        @InjectModel(Order.name) private orderModel: Model<Order>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest<Request>();
        const companyId = request.query.companyId// Lấy companyId từ request

        if (!companyId) {
            throw new ForbiddenException('Công ty không hợp lệ.');
        }

        // Kiểm tra công ty có mua dịch vụ không và còn hiệu lực không
        const service = await this.orderModel.findOne({
            companyId,
            code: 'STATISTICAL_PACKAGE',
            isActive: true,
            endDate: { $gte: new Date() }, // Chỉ lấy dịch vụ chưa hết hạn
        });
        console.log(service)

        if (!service) {
            throw new ForbiddenException('Công ty chưa mua dịch vụ xem thống kê.');
        }

        return true; // Cho phép truy cập
    }
}
