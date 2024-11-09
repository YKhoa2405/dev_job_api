import { Injectable } from '@nestjs/common';
import { CreateSkillDto } from './dto/create-skill.dto';
import { UpdateSkillDto } from './dto/update-skill.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Skill, SkillDocument } from './schemas/skill.schema';
import { Model } from 'mongoose';

@Injectable()
export class SkillsService {
  constructor(@InjectModel(Skill.name) private skillModel: Model<SkillDocument>) { }

  createSkill(createSkillDto: CreateSkillDto) {
    return this.skillModel.create({ ...createSkillDto })
  }

  getAllSkill() {
    return this.skillModel.find().sort({ name: 1 }).exec();
  }


  updateSkill(id: string, updateSkillDto: UpdateSkillDto) {
    return this.skillModel.updateOne({ _id: id }, { ...updateSkillDto })
  }

  removeSkill(id: string) {
    return this.skillModel.deleteOne({ _id: id })
  }
}
