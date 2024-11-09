
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Role } from 'src/roles/schemas/role.schema';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ unique: true })
  email: string;

  @Prop()
  password: string;

  @Prop()
  name: string;

  @Prop()
  avatar: string

  @Prop({ type: Object })
  company: {
    _id: mongoose.Schema.Types.ObjectId
  }

  @Prop()
  refreshToken: string

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Role.name })
  role: mongoose.Schema.Types.ObjectId

  @Prop({ type: Object })
  updateBy: {
    _id: mongoose.Schema.Types.ObjectId,
    email: string
  }

  @Prop()
  isDeleted: boolean
  @Prop()
  deletedAt: Date
}

export const UserSchema = SchemaFactory.createForClass(User);
