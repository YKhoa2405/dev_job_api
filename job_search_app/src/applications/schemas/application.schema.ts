
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Company } from 'src/companies/schemas/company.schema';
import { Job } from 'src/jobs/schemas/job.schema';

export type ApplicationDocument = HydratedDocument<Application>;

export enum ApplicationStatus {
    Pending = 'Chờ xử lý',
    Reviewed = 'Đã xem',
    Accepted = 'Chấp nhận',
    Rejected = 'Từ chối',
}

@Schema({ timestamps: true })
export class Application {
    @Prop()
    userId:mongoose.Schema.Types.ObjectId


    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Job' })
    jobId: Job;
  
    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company' })
    companyId: Company;

    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    phone: string;

    @Prop({ required: true })
    email: string;

    @Prop()
    cv: string;

    @Prop({ type: Object })
    createBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    }

    @Prop({ type: Object })
    updateBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string
    }

    @Prop({ type: String, enum: ApplicationStatus, default: ApplicationStatus.Pending })
    status: ApplicationStatus

}

export const ApplicationSchema = SchemaFactory.createForClass(Application);
