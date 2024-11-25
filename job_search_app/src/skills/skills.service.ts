import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { Model } from 'mongoose';
import aqp from 'api-query-params';

@Injectable()
export class SkillsService {
  constructor(@InjectModel(Skill.name) private skillModel: Model<SkillDocument>) { }

  async createSkill(createSkillDto: CreateSkillDto) {
    const { name } = createSkillDto
    const isExits = await this.skillModel.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (isExits) {
      throw new BadRequestException('Công nghệ đã tồn tại');
    }
    return this.skillModel.create({ ...createSkillDto })
  }

  async getAllSkill(currentPage: number, limit: number, qr: string) {
    const { filter, sort, population, projection } = aqp(qr);
    delete filter.page;
    delete filter.pageSize;

    const skip = (currentPage - 1) * limit;
    const defaultLimit = limit ? limit : 10

    const totalItems = await this.skillModel.countDocuments(filter);
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.skillModel
      .find(filter)
      .skip(skip)
      .limit(defaultLimit)
      .sort(sort as any)
      .exec();

    return {
      meta: {
        currentPage,
        pageSize: defaultLimit,
        totalItems,
        totalPages,
      },
      result,
    };
  }


  updateSkill(id: string, updateSkillDto: UpdateSkillDto) {
    return this.skillModel.updateOne({ _id: id }, { ...updateSkillDto })
  }

  removeSkill(id: string) {
    return this.skillModel.deleteOne({ _id: id })
  }
}
