import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schema';
import { FilesModule } from 'src/files/files.module';
import { Job, JobSchema } from 'src/jobs/schemas/job.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]), FilesModule,
  MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }])],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports: [CompaniesService, MongooseModule]
})
export class CompaniesModule { }
