import { Module } from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { CompaniesController } from './companies.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Company, CompanySchema } from './schemas/company.schema';
import { FilesModule } from 'src/files/files.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: Company.name, schema: CompanySchema }]), FilesModule],
  controllers: [CompaniesController],
  providers: [CompaniesService],
  exports:[CompaniesService, MongooseModule]
})
export class CompaniesModule {}
