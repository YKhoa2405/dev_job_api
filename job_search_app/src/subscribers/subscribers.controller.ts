import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { Public, User } from 'src/common/decorator/customize';
import { SubscribersService } from './subscribers.service';
import { CreateSubscriberDto } from './dto/create-subscriber.dto';
import { UpdateSubscriberDto } from './dto/update-subscriber.dto';
import { IUser } from 'src/users/users.interface';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) { }

  @Post()
  create(@Body() createSubscriberDto: CreateSubscriberDto, @User() user: IUser) {
    return this.subscribersService.createSubscriber(createSubscriberDto, user);
  }

  @Get()
  findAll(
    @Query("page") currentPage: string,
    @Query("pageSize") limit: string,
    @Query() qr: string,
  ) {
    return this.subscribersService.getAllSubscribers(+currentPage, +limit, qr);
  }



  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubscriberDto: UpdateSubscriberDto) {
    return this.subscribersService.updateSubscriber(id, updateSubscriberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscribersService.removeSubscriber(id);
  }
}
