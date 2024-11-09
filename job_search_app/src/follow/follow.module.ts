import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from 'src/users/schemas/user.schema';
import { Company, CompanySchema } from 'src/companies/schemas/company.schema';
import { Follow, FollowSchema } from './schemas/follow.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]),
    MongooseModule.forFeature([{ name: Follow.name, schema: FollowSchema }]),  // Nhập Follow Model vào Module
  ],
  controllers: [FollowController],
  providers: [FollowService],
})
export class FollowModule {}
