import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ServiceDocument = HydratedDocument<Service>;

@Schema({ timestamps: true })
export class Service {
    @Prop()
    name: string;

    @Prop()
    description: string;

    @Prop()
    price: number;

    @Prop()
    durationDays: number;

    @Prop()
    isActive: boolean;

    @Prop({ type: Object })
    createBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string;
    }

    @Prop({ type: Object })
    updateBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string;
    }
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
