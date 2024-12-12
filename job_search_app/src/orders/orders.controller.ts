import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.createOrder(createOrderDto);
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
  findOne(@Param('id') id: string) {
    return this.ordersService.getOrderByCompany(id);
  }


}
