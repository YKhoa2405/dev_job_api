import { Injectable } from '@nestjs/common';
import { CreateFollowDto } from './dto/create-follow.dto';
import { UpdateFollowDto } from './dto/update-follow.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Follow } from './schemas/follow.schema';
import { Company } from 'src/companies/schemas/company.schema';
import { User } from 'src/users/schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class FollowService {
  constructor(
    @InjectModel(Follow.name) private readonly followModel: Model<Follow>,  // Inject Follow model
    @InjectModel(User.name) private readonly userModel: Model<User>,  // Inject User model
    @InjectModel(Company.name) private readonly companyModel: Model<Company>,  // Inject Company model
  ) { }

  async getFollowedCompanies(userId: string) {
    const follows = await this.followModel
      .find({ userId })
      .select('companyId') // Chỉ lấy `companyId` từ `Follow`
      .lean()
      .exec();

    const companyIds = follows.map((follow) => follow.companyId);
    return this.companyModel
      .find({ _id: { $in: companyIds } })
      .select('name avatar slogan field followers')
      .lean()
      .exec();
  }


  async followCompany(userId: string, companyId: string) {
    const existingFollow = await this.followModel.findOne({ userId, companyId });
    if (existingFollow) {
      return { message: 'User already follows this company' };
    }

    const follow = this.followModel.create({ userId, companyId });

    await this.companyModel.updateOne(
      { _id: companyId },
      { $inc: { followers: 1 } }
    );

    return follow
  }


  async unFollowCompany(userId: string, companyId: string) {
    const existingFollow = await this.followModel.findOne({ userId, companyId });
    if (!existingFollow) {
      return { message: 'Successfully unfollowed the company' };
    }

    await this.followModel.deleteOne({ userId, companyId });

    await this.companyModel.updateOne(
      { _id: companyId },
      { $inc: { followers: -1 } }
    );

    return { message: 'Successfully unfollowed the company' };
  }
}
