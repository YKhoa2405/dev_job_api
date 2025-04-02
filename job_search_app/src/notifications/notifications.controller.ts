import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CreateNotificationDto } from './dto/create-notification.dto';
import { UpdateNotificationDto } from './dto/update-notification.dto';
import { User } from 'src/common/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) { }

  @Post()
  create(@Body() createNotificationDto: CreateNotificationDto, @User() user: IUser) {
    const userId = user._id
    return this.notificationsService.create(createNotificationDto, userId);
  }

  @Get()
  findAllByUser(
    @Param('userId') userId: string,
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string
  ) {
    return this.notificationsService.findAllByUser(userId,+currentPage, +limit, qr);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNotificationDto: UpdateNotificationDto) {
    return this.notificationsService.update(+id, updateNotificationDto);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.notificationsService.remove(+id);
  // }

  @Delete()
  removeAll(@Body() userID: string) {
    return this.notificationsService.removeAllByUser(userID);
  }
}
