import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type CvDocument = HydratedDocument<Cv>;

@Schema({ timestamps: true }) // Tự động thêm createdAt và updatedAt
export class Cv {
    @Prop()
    userId: mongoose.Schema.Types.ObjectId;

    @Prop()
    name: string;

    @Prop()
    url: string;

    @Prop()
    processedText: string;

    @Prop({default: false})
    isPrimary: boolean

}

export const CvSchema = SchemaFactory.createForClass(Cv);