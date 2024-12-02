import { Module } from '@nestjs/common';
import { CvService } from './cv.service';
import { CvController } from './cv.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Cv, CvSchema } from './schemas/cv.schema';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Cv.name, schema: CvSchema }]),FilesModule],
  controllers: [CvController],
  providers: [CvService],
  exports: [CvService]
})
export class CvModule { }
