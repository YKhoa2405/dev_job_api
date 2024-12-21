import { Controller, Get, Post, Body, Patch, Param, Delete, Request, Query } from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { User } from 'src/common/decorator/customize';
import { IUser } from 'src/users/users.interface';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) { }

  @Post()
  create(
    @User() user: IUser,
    @Body('companyId') companyId: string,
  ) {
    const userId = user._id;
    return this.followService.followCompany(userId, companyId);
  }


  @Delete(':companyId')
  remove(
    @User() user: IUser,
    @Param('companyId') companyId: string,
  ) {
    const userId = user._id;
    console.log(userId);
    return this.followService.unFollowCompany(userId, companyId);
  }


  @Get()
  findFollowByUser(
    @User() user: IUser,
    @Query("page") currentPage: string,
    @Query("limit") limit: string,
    @Query() qr: string,
  ) {
    const userId = user._id;
    return this.followService.getFollowByUser(+currentPage, +limit, qr, userId);
  }

  @Get(':companyId/isSaved')
  async isSaved(
    @User() user: IUser,
    @Param('companyId') companyId: string,
  ) {
    const userId = user._id; // Lấy ID của người dùng hiện tại
    return this.followService.isCompanySaved(userId, companyId);
  }

}
