import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type PermissionDocument = HydratedDocument<Permission>;


@Schema({ timestamps: true })
export class Permission {
    @Prop()
    name: string;

    @Prop()
    apiPath: string;

    @Prop()
    method: string;

    @Prop()
    module: string

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

    @Prop({ type: Object })
    deleteBy: {
        _id: mongoose.Schema.Types.ObjectId,
        email: string;
    }
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
