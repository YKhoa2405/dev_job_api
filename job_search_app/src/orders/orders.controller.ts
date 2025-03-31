import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { User } from 'src/common/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @User() user: IUser
  ) {
    return this.ordersService.createOrder(createOrderDto,user);
  }

  @Get()
  findAll(
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qs: string
  ) {
    return this.ordersService.getAllOrder(+currentPage, +limit, qs);
  }

  @Get(':id')
  findOrderByCompany(@Param('id') id: string) {
    return this.ordersService.getOrderByCompany(id);
  }

  @Get(':id/detail')
  findOne(@Param('id') id: string) {
    return this.ordersService.getOrderDetail(id);
  }


}
