import { Controller, Get, Post, Body, Patch, Param, Delete, Request } from '@nestjs/common';
import { FollowService } from './follow.service';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';

@Controller('follows')
export class FollowController {
  constructor(private readonly followService: FollowService) { }

  @Post('follow')
  create(
    @Request() req,
    @Body('companyId') companyId: string,
  ) {
    console.log(companyId)
    return this.followService.followCompany(req.user._id, companyId);
  }


  @Delete('unfollow')
  remove(
    @Request() req,
    @Body('companyId') companyId: string,) {
    return this.followService.unFollowCompany(req.user._id, companyId);
  }

  @Get('followed')
  async getFollowedCompanies(
    @Request() req) {
    const userId = req.user._id;  // Lấy userId từ token
    return this.followService.getFollowedCompanies(userId);  // Gọi service để lấy tất cả các công ty
  }

}
