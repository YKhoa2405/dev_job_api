import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order, OrderSchema } from './schemas/order.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Service, ServiceSchema } from 'src/services/schemas/service.schema';
import { NotificationsModule } from 'src/notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Order.name, schema: OrderSchema }]),
    MongooseModule.forFeature([{ name: Service.name, schema: ServiceSchema }]),
    NotificationsModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService]
})
export class OrdersModule { }
