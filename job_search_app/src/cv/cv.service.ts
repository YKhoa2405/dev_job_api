import { Injectable } from '@nestjs/common';
import { CreateCvDto } from './dto/create-cv.dto';
import { UpdateCvDto } from './dto/update-cv.dto';
import { IUser } from 'src/users/users.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Cv, CvDocument } from './schemas/cv.schema';
import { Model } from 'mongoose';

@Injectable()
export class CvService {
  constructor(@InjectModel(Cv.name) private cvModel: Model<CvDocument>) { }

  async createCv(createCvDto: CreateCvDto, user: IUser, cvUrl: string) {
    const { name } = createCvDto
    let newApply = await this.cvModel.create({
      url: cvUrl,
      userId: user._id,
      name
    })
    console.log(newApply)
    return newApply;
  }

  findAll() {
    return `This action returns all cv`;
  }

  async getCvByCurrentUser(id: string) {
    return await this.cvModel
      .find({ userId: id })
      .exec();
  }

  updateCv(id: string, updateCvDto: UpdateCvDto) {
    return this.cvModel.updateOne({ _id: id }, { ...updateCvDto })
  }

  removeCv(id: string) {
    return this.cvModel.deleteOne({ _id: id });
  }
}
